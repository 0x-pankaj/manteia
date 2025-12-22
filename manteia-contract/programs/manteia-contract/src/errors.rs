use anchor_lang::prelude::*;

#[error_code]
pub enum BettingError {
    #[msg("Arithmetic overflow occurred")]
    ArithmeticOverflow,

    #[msg("Unauthorized access")]
    Unauthorized,

    #[msg("Insufficient balance to place bet")]
    InsufficientBalance,

    #[msg("Bet has already been resolved")]
    BetAlreadyResolved,

    #[msg("Prediction window has not ended yet")]
    PredictionWindowNotEnded,

    #[msg("Too many active bets (max 10)")]
    TooManyActiveBets,

    #[msg("Bet not found or not active")]
    BetNotActive,

    #[msg("Invalid time window configuration")]
    InvalidTimeWindow,

    #[msg("Invalid price range configuration")]
    InvalidPriceRange,

    #[msg("Bet amount must be greater than zero")]
    InvalidBetAmount,

    #[msg("No unclaimed balance to claim")]
    NoUnclaimedBalance,
}
