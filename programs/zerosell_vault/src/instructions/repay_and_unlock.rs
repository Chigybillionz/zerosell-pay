use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Token, TokenAccount, Transfer};
use crate::state::{ProtocolConfig, UserLoanPosition, POSITION_STATUS_ACTIVE, POSITION_STATUS_REPAID};
use crate::constants::{PROTOCOL_CONFIG_SEED, USER_POSITION_SEED, COLLATERAL_VAULT_SEED};
use crate::errors::ZeroSellError;

#[derive(Accounts)]
#[instruction(invoice_id: u64)]
pub struct RepayAndUnlock<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,

    #[account(
        mut,
        seeds = [PROTOCOL_CONFIG_SEED],
        bump = protocol_config.bump
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(
        mut,
        seeds = [
            USER_POSITION_SEED,
            borrower.key().as_ref(),
            invoice_id.to_le_bytes().as_ref()
        ],
        bump = user_loan_position.bump,
        has_one = borrower @ ZeroSellError::Unauthorized
    )]
    pub user_loan_position: Account<'info, UserLoanPosition>,

    #[account(
        mut,
        constraint = borrower_usdc_ata.mint == protocol_config.usdc_mint @ ZeroSellError::InvalidCollateralAccount,
        constraint = borrower_usdc_ata.owner == borrower.key() @ ZeroSellError::Unauthorized
    )]
    pub borrower_usdc_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = protocol_config.liquidity_vault @ ZeroSellError::InvalidCollateralAccount
    )]
    pub liquidity_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = borrower_collateral_ata.mint == user_loan_position.collateral_mint @ ZeroSellError::CollateralMintMismatch,
        constraint = borrower_collateral_ata.owner == borrower.key() @ ZeroSellError::Unauthorized
    )]
    pub borrower_collateral_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            COLLATERAL_VAULT_SEED,
            borrower.key().as_ref(),
            invoice_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub collateral_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<RepayAndUnlock>,
    invoice_id: u64,
    repay_amount_usdc: u64,
) -> Result<()> {
    require!(repay_amount_usdc > 0, ZeroSellError::InvalidRepaymentAmount);

    let position = &mut ctx.accounts.user_loan_position;
    require!(
        position.status == POSITION_STATUS_ACTIVE,
        ZeroSellError::PositionNotActive
    );

    let borrower_key = ctx.accounts.borrower.key();
    let invoice_bytes = invoice_id.to_le_bytes();
    let is_full_repay = repay_amount_usdc >= position.debt_usdc_amount;

    let actual_repay_usdc = if is_full_repay {
        position.debt_usdc_amount
    } else {
        repay_amount_usdc
    };

    // Calculate proportional collateral to unlock
    let collateral_to_release = if is_full_repay {
        position.collateral_locked
    } else {
        let released = (actual_repay_usdc as u128)
            .checked_mul(position.collateral_locked as u128)
            .ok_or(ZeroSellError::MathOverflow)?
            .checked_div(position.debt_usdc_amount as u128)
            .ok_or(ZeroSellError::MathOverflow)? as u64;
        released
    };

    // 1. EFFECTS: Mutate position state before CPIs (CEI Pattern)
    position.debt_usdc_amount = position
        .debt_usdc_amount
        .checked_sub(actual_repay_usdc)
        .ok_or(ZeroSellError::MathOverflow)?;

    position.collateral_locked = position
        .collateral_locked
        .checked_sub(collateral_to_release)
        .ok_or(ZeroSellError::MathOverflow)?;

    if is_full_repay {
        position.status = POSITION_STATUS_REPAID;
    }

    let config = &mut ctx.accounts.protocol_config;
    config.total_usdc_lent = config.total_usdc_lent.saturating_sub(actual_repay_usdc);

    // 2. INTERACTIONS: CPI token transfers
    // Transfer USDC from borrower to liquidity vault
    let transfer_usdc_cpi = Transfer {
        from: ctx.accounts.borrower_usdc_ata.to_account_info(),
        to: ctx.accounts.liquidity_vault.to_account_info(),
        authority: ctx.accounts.borrower.to_account_info(),
    };
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_usdc_cpi,
        ),
        actual_repay_usdc,
    )?;

    // Transfer unlocked collateral from collateral_vault back to borrower signed by user_loan_position PDA
    let position_bump = position.bump;
    let signer_seeds: &[&[&[u8]]] = &[&[
        USER_POSITION_SEED,
        borrower_key.as_ref(),
        invoice_bytes.as_ref(),
        &[position_bump],
    ]];

    let transfer_collateral_cpi = Transfer {
        from: ctx.accounts.collateral_vault.to_account_info(),
        to: ctx.accounts.borrower_collateral_ata.to_account_info(),
        authority: position.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_collateral_cpi,
            signer_seeds,
        ),
        collateral_to_release,
    )?;

    // If fully repaid, close the collateral vault and refund rent lamports to borrower
    if is_full_repay {
        let close_cpi = CloseAccount {
            account: ctx.accounts.collateral_vault.to_account_info(),
            destination: ctx.accounts.borrower.to_account_info(),
            authority: position.to_account_info(),
        };
        token::close_account(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            close_cpi,
            signer_seeds,
        ))?;
    }

    msg!(
        "RepayAndUnlock: Inv: {}, Repaid: {} USDC, Released: {} Collateral, Remaining Debt: {}",
        invoice_id,
        actual_repay_usdc,
        collateral_to_release,
        position.debt_usdc_amount
    );

    Ok(())
}

