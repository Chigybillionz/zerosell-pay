use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Token, TokenAccount, Transfer};
use crate::state::{GlobalPool, UserPosition, POSITION_STATUS_ACTIVE, POSITION_STATUS_REPAID};
use crate::constants::{GLOBAL_POOL_SEED, POSITION_SEED, COLLATERAL_VAULT_SEED};
use crate::errors::ZeroSellError;

#[derive(Accounts)]
#[instruction(invoice_id: u64)]
pub struct RepayPosition<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_POOL_SEED],
        bump = global_pool.bump
    )]
    pub global_pool: Account<'info, GlobalPool>,

    #[account(
        mut,
        seeds = [
            POSITION_SEED,
            borrower.key().as_ref(),
            invoice_id.to_le_bytes().as_ref()
        ],
        bump = user_position.bump,
        has_one = borrower @ ZeroSellError::Unauthorized
    )]
    pub user_position: Account<'info, UserPosition>,

    #[account(
        mut,
        constraint = borrower_usdc_ata.mint == global_pool.usdc_mint @ ZeroSellError::InvalidCollateralAccount,
        constraint = borrower_usdc_ata.owner == borrower.key() @ ZeroSellError::Unauthorized
    )]
    pub borrower_usdc_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = global_pool.usdc_vault
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = borrower_collateral_account.mint == user_position.collateral_mint @ ZeroSellError::CollateralMintMismatch,
        constraint = borrower_collateral_account.owner == borrower.key() @ ZeroSellError::Unauthorized
    )]
    pub borrower_collateral_account: Account<'info, TokenAccount>,

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

pub fn handler(ctx: Context<RepayPosition>, invoice_id: u64) -> Result<()> {
    let position = &mut ctx.accounts.user_position;
    require!(position.status == POSITION_STATUS_ACTIVE, ZeroSellError::PositionNotActive);

    let debt_amount = position.debt_usdc_amount;
    let collateral_amount = position.collateral_amount;
    let borrower_key = ctx.accounts.borrower.key();
    let invoice_bytes = invoice_id.to_le_bytes();

    // 1. Repay debt: Transfer USDC from borrower to usdc_vault
    let transfer_usdc_cpi = Transfer {
        from: ctx.accounts.borrower_usdc_ata.to_account_info(),
        to: ctx.accounts.usdc_vault.to_account_info(),
        authority: ctx.accounts.borrower.to_account_info(),
    };
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_usdc_cpi,
        ),
        debt_amount,
    )?;

    // 2. Unlock collateral: Transfer collateral back to borrower signed by user_position PDA
    let position_seeds: &[&[u8]] = &[
        POSITION_SEED,
        borrower_key.as_ref(),
        invoice_bytes.as_ref(),
        &[position.bump],
    ];
    let signer = &[position_seeds];

    let transfer_collateral_cpi = Transfer {
        from: ctx.accounts.collateral_vault.to_account_info(),
        to: ctx.accounts.borrower_collateral_account.to_account_info(),
        authority: position.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_collateral_cpi,
            signer,
        ),
        collateral_amount,
    )?;

    // 3. Close the collateral vault account to return rent lamports to borrower
    let close_cpi = CloseAccount {
        account: ctx.accounts.collateral_vault.to_account_info(),
        destination: ctx.accounts.borrower.to_account_info(),
        authority: position.to_account_info(),
    };
    token::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        close_cpi,
        signer,
    ))?;

    // 4. Update protocol metrics and position status
    let pool = &mut ctx.accounts.global_pool;
    pool.total_usdc_lent = pool.total_usdc_lent.saturating_sub(debt_amount);

    position.status = POSITION_STATUS_REPAID;

    msg!(
        "Position Repaid! Invoice: {}, Debt Cleared: {} USDC, Collateral Returned: {}",
        invoice_id,
        debt_amount,
        collateral_amount
    );

    Ok(())
}

