use anchor_lang::prelude::*;

pub const MAX_ACTIVE_BETS: usize = 20;
pub const BACKEND_AUTHORITY: Pubkey = pubkey!("HCvWBZpYDeiTMUaSmCRm5jP67M6wYV2NDBjAG4qdDLNE");

#[account]
pub struct ProxyAccount {
    pub owner: Pubkey,
    pub balance: u64,
    pub total_bets_placed: u64,
    pub active_bet_count: u8,
    pub bets: [Bet; MAX_ACTIVE_BETS],
}

impl ProxyAccount {
    pub const SPACE: usize = 32 + 8 + 8 + 1 + (74 * MAX_ACTIVE_BETS);
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug)]
pub struct Bet {
    pub bet_id: u64,
    pub amount: u64,
    pub target_price_range_start: u64,
    pub target_price_range_end: u64,
    pub prediction_start_time: i64,
    pub prediction_end_time: i64,
    pub placed_at: i64,
    pub resolved: bool,
    pub won: bool,
    pub active: bool,
    pub payout_multiplier: u64,
    pub reserved: [u8; 7],
}

impl Default for Bet {
    fn default() -> Self {
        Self {
            bet_id: 0,
            amount: 0,
            target_price_range_start: 0,
            target_price_range_end: 0,
            prediction_start_time: 0,
            prediction_end_time: 0,
            placed_at: 0,
            resolved: false,
            won: false,
            active: false,
            payout_multiplier: 0,
            reserved: [0; 7],
        }
    }
}

impl Bet {
    pub fn is_valid_time_window(&self, current_time: i64) -> bool {
        self.placed_at < self.prediction_start_time
            && self.prediction_start_time < self.prediction_end_time
            && current_time >= self.prediction_end_time
    }
}