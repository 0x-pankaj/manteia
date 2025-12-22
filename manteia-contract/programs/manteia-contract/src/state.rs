use anchor_lang::prelude::*;

pub const MAX_ACTIVE_BETS: usize = 10;

// Conversion ratio: 1 SOL = 1000 tokens, so 0.1 SOL = 100 tokens
pub const TOKENS_PER_SOL: u64 = 1_000;
pub const LAMPORTS_PER_TOKEN: u64 = 1_000_000; // LAMPORTS_PER_SOL / TOKENS_PER_SOL

// TODO: Replace with your actual backend authority keypair pubkey
pub const BACKEND_AUTHORITY: Pubkey = pubkey!("HCvWBZpYDeiTMUaSmCRm5jP67M6wYV2NDBjAG4qdDLNE");

#[account]
pub struct ProxyAccount {
    pub owner: Pubkey,                // 32 bytes
    pub balance: u64,                 // 8 bytes
    pub unclaimed_balance: u64,       // 8 bytes
    pub total_bets_placed: u64,       // 8 bytes
    pub active_bet_count: u8,         // 1 byte
    pub bets: [Bet; MAX_ACTIVE_BETS], // 74 * 10 = 740 bytes
}

impl ProxyAccount {
    // Fixed: 32 + 8 + 8 + 8 + 1 = 57 (not 65!)
    pub const SPACE: usize = 32 + 8 + 8 + 8 + 1 + (Bet::SPACE * MAX_ACTIVE_BETS);
}

/// Global game account that holds all deposited SOL
/// This centralizes fund management and enables future multi-token support
#[account]
pub struct GameAccount {
    pub authority: Pubkey,   // 32 bytes - admin who can manage the account
    pub total_deposits: u64, // 8 bytes - total SOL deposited (in lamports)
    pub bump: u8,            // 1 byte - PDA bump for signing
}

impl GameAccount {
    pub const SPACE: usize = 32 + 8 + 1;
    pub const SEED: &'static [u8] = b"game_vault";
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug)]
pub struct Bet {
    pub bet_id: u64,                   // 8
    pub amount: u64,                   // 8
    pub target_price_range_start: u64, // 8
    pub target_price_range_end: u64,   // 8
    pub prediction_start_time: i64,    // 8
    pub prediction_end_time: i64,      // 8
    pub placed_at: i64,                // 8
    pub resolved: bool,                // 1
    pub won: bool,                     // 1
    pub active: bool,                  // 1
    pub payout_multiplier: u64,        // 8
    pub reserved: [u8; 7],             // 7
}

impl Bet {
    // 8*8 + 1*3 + 7 = 74 bytes
    pub const SPACE: usize = 8 + 8 + 8 + 8 + 8 + 8 + 8 + 1 + 1 + 1 + 8 + 7;
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
