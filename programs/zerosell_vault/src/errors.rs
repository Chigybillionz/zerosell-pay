use anchor_lang::prelude::*;

#[error_code]
pub enum ZeroSellError {
    #[msg("Pyth oracle price is stale (> 60 seconds old).")]
    OraclePriceStale,

    #[msg("Oracle confidence interval exceeds 2% of price.")]
    OracleConfidenceTooWide,

    #[msg("Requested borrow amount exceeds maximum LTV threshold (Max 50%).")]
    LtvLimitExceeded,

    #[msg("ZeroSell Protocol operations are currently paused by admin.")]
    ProtocolPaused,

    #[msg("Math calculation overflow occurred.")]
    MathOverflow,

    #[msg("Invalid repayment amount specified.")]
    InvalidRepaymentAmount,

    #[msg("User position is already repaid or liquidated.")]
    PositionNotActive,

    #[msg("Position is healthy and cannot be liquidated (LTV below threshold).")]
    PositionHealthy,

    #[msg("Protocol liquidity vault has insufficient USDC balance.")]
    InsufficientLiquidity,

    #[msg("Caller is not authorized to perform this operation.")]
    Unauthorized,

    #[msg("Invoice ID must be non-zero.")]
    InvalidInvoiceId,

    #[msg("Collateral amount must be greater than zero.")]
    ZeroCollateral,

    #[msg("Merchant USDC amount must be greater than zero.")]
    ZeroBorrowAmount,

    #[msg("Invalid collateral token account provided.")]
    InvalidCollateralAccount,

    #[msg("Collateral mint does not match position record.")]
    CollateralMintMismatch,

    #[msg("Invalid treasury account.")]
    InvalidTreasury,
}
