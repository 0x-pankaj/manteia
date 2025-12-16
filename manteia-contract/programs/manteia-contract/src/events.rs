use anchor_lang::prelude::*;

#[event]
pub struct BetPlacedEvent {
    pub user: Pubkey,
    pub bet_id: u64,
    pub amount: u64,
    pub target_price_range_start: u64,
    pub target_price_range_end: u64,
    pub prediction_start_time: i64,
    pub prediction_end_time: i64,
    pub placed_at: i64,
    pub payout_multiplier: u64,
}

#[event]
pub struct BetResolvedEvent {
    pub user: Pubkey,
    pub bet_id: u64,
    pub won: bool,
    pub bet_amount: u64,
    pub payout_amount: u64,
    pub resolved_at: i64,
}

#[event]
pub struct DepositEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub new_balance: u64,
}

#[event]
pub struct WithdrawEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub new_balance: u64,
}