use crate::errors::BettingError;
use crate::events::BetResolvedEvent;
use crate::state::{ProxyAccount, BACKEND_AUTHORITY};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ResolveBet<'info> {
    #[account(mut)]
    pub proxy_account: Account<'info, ProxyAccount>,

    #[account(
        constraint = *backend_authority.key == BACKEND_AUTHORITY @ BettingError::Unauthorized
    )]
    pub backend_authority: Signer<'info>,
}

pub fn resolve_bet(
    ctx: Context<ResolveBet>,
    bet_id: u64,
    won: bool,
    payout_amount: u64, // Now receiving payout directly from frontend
) -> Result<()> {
    let proxy_account = &mut ctx.accounts.proxy_account;
    let clock = Clock::get()?;
    let current_time = clock.unix_timestamp;

    // Find the bet by bet_id and copy necessary data
    let mut bet_slot = None;
    let mut bet_amount = 0u64;

    for (i, bet) in proxy_account.bets.iter().enumerate() {
        if bet.active && bet.bet_id == bet_id {
            bet_slot = Some(i);
            bet_amount = bet.amount;
            break;
        }
    }

    let slot = bet_slot.ok_or(BettingError::BetNotActive)?;
    let bet_owner = proxy_account.owner;

    // Now we can safely get mutable reference
    let bet = &mut proxy_account.bets[slot];

    // Validations
    require!(bet.active, BettingError::BetNotActive);
    require!(!bet.resolved, BettingError::BetAlreadyResolved);
    require!(
        bet.is_valid_time_window(current_time),
        BettingError::PredictionWindowNotEnded
    );

    // Mark as resolved
    bet.resolved = true;
    bet.won = won;
    bet.active = false; // Free the slot immediately

    // Update active bet count
    proxy_account.active_bet_count = proxy_account
        .active_bet_count
        .checked_sub(1)
        .ok_or(BettingError::ArithmeticOverflow)?;

    // Credit payout if won to unclaimed balance
    if won {
        require!(payout_amount > 0, BettingError::InvalidBetAmount);

        proxy_account.unclaimed_balance = proxy_account
            .unclaimed_balance
            .checked_add(payout_amount)
            .ok_or(BettingError::ArithmeticOverflow)?;
    }

    emit!(BetResolvedEvent {
        user: bet_owner,
        bet_id,
        won,
        bet_amount,
        payout_amount: if won { payout_amount } else { 0 },
        resolved_at: current_time,
    });

    msg!(
        "Bet resolved: ID={}, Won={}, Payout={}",
        bet_id,
        won,
        if won { payout_amount } else { 0 }
    );

    Ok(())
}
