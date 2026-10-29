use anchor_lang::prelude::*;

#[error_code]
pub enum ZeroSellError {
    #[msg("Requested borrow amount exceeds maximum LTV threshold (Max 50%).")]
    LtvExceeded,

    #[msg("Oracle price is stale or invalid.")]
    StaleOracle,

    #[msg("Invalid oracle price feed provided.")]
    InvalidOraclePrice,

    #[msg("User position is not active (already repaid or liquidated).")]
    PositionNotActive,

    #[msg("Position is healthy and cannot be liquidated (LTV below threshold).")]
    PositionHealthy,

    #[msg("Global liquidity pool has insufficient USDC liquidity.")]
    InsufficientVaultLiquidity,

    #[msg("Math calculation overflow occurred.")]
    MathOverflow,

    #[msg("Unauthorized operation.")]
    Unauthorized,

    #[msg("Invoice ID must be non-zero.")]
    InvalidInvoiceId,

    #[msg("Collateral amount must be greater than zero.")]
    ZeroCollateral,

    #[msg("Merchant USDC amount must be greater than zero.")]
    ZeroMerchantAmount,

    #[msg("Invalid collateral token account.")]
    InvalidCollateralAccount,

    #[msg("Collateral mint does not match position.")]
    CollateralMintMismatch,
}

