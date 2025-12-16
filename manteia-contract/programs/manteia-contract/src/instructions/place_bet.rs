use anchor_lang::prelude::*;
use crate::events::BetPlacedEvent;
use crate::state::{ProxyAccount, Bet, MAX_ACTIVE_BETS};
use crate::errors::BettingError;

    #[derive(Accounts)]
    pub struct PlaceBet<'info> {
        #[account(
            mut,
            seeds = [b"proxy", user.key().as_ref()],
            bump,
            constraint = proxy_account.owner == *user.key @ BettingError::Unauthorized
        )]
        pub proxy_account: Account<'info, ProxyAccount>,
        
        #[account(mut)]
        pub user: Signer<'info>,
    }

    pub fn place_bet(
        ctx: Context<PlaceBet>,
        amount: u64,
        target_price_range_start: u64,
        target_price_range_end: u64,
        prediction_start_time: i64,
        prediction_end_time: i64,
        payout_multiplier: u64,
    ) -> Result<()> {
        let proxy_account = &mut ctx.accounts.proxy_account;
        let clock = Clock::get()?;
        let current_time = clock.unix_timestamp;

        // Validations
        require!(amount > 0, BettingError::InvalidBetAmount);
        require!(
            proxy_account.balance >= amount,
            BettingError::InsufficientBalance
        );
        require!(
            proxy_account.active_bet_count < MAX_ACTIVE_BETS as u8,
            BettingError::TooManyActiveBets
        );
        require!(
            target_price_range_start < target_price_range_end,
            BettingError::InvalidPriceRange
        );
        require!(
            current_time < prediction_start_time && prediction_start_time < prediction_end_time,
            BettingError::InvalidTimeWindow
        );

        // Deduct amount from balance
        proxy_account.balance = proxy_account
            .balance
            .checked_sub(amount)
            .ok_or(BettingError::ArithmeticOverflow)?;

        // Find first empty slot
        let mut slot_index = None;
        for (i, bet) in proxy_account.bets.iter().enumerate() {
            if !bet.active {
                slot_index = Some(i);
                break;
            }
        }

        let slot = slot_index.ok_or(BettingError::TooManyActiveBets)?;
        let bet_id = proxy_account.total_bets_placed;

        // Calculate payout multiplier based on window duration (example: 5s = 2x)
        let duration = prediction_end_time - prediction_start_time;
        

        // Create bet
        proxy_account.bets[slot] = Bet {
            bet_id,
            amount,
            target_price_range_start,
            target_price_range_end,
            prediction_start_time,
            prediction_end_time,
            placed_at: current_time,
            resolved: false,
            won: false,
            active: true,
            payout_multiplier,
            reserved: [0; 7],
        };

        proxy_account.active_bet_count += 1;
        proxy_account.total_bets_placed += 1;

        // Emit event for backend
        emit!(BetPlacedEvent {
            user: *ctx.accounts.user.key,
            bet_id,
            amount,
            target_price_range_start,
            target_price_range_end,
            prediction_start_time,
            prediction_end_time,
            placed_at: current_time,
            payout_multiplier,
        });

        msg!(
            "Bet placed: ID={}, Amount={}, Window={}-{}, Price Range={}-{}",
            bet_id,
            amount,
            prediction_start_time,
            prediction_end_time,
            target_price_range_start,
            target_price_range_end
        );

        Ok(())
    }