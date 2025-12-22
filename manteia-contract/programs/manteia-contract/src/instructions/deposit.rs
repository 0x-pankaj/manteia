use crate::errors::BettingError;
use crate::events::DepositEvent;
use crate::state::{GameAccount, ProxyAccount};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Deposit<'info> {
    /// The global game account that holds all deposited SOL
    #[account(
        mut,
        seeds = [GameAccount::SEED],
        bump = game_account.bump
    )]
    pub game_account: Account<'info, GameAccount>,

    #[account(
        mut,
        seeds = [b"proxy", user.key().as_ref()],
        bump,
        constraint = proxy_account.owner == *user.key @ BettingError::Unauthorized
    )]
    pub proxy_account: Account<'info, ProxyAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    require!(amount > 0, BettingError::InvalidBetAmount);

    // Transfer SOL from user to game account (centralized vault)
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        anchor_lang::system_program::Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.game_account.to_account_info(),
        },
    );
    anchor_lang::system_program::transfer(cpi_context, amount)?;

    // Track total deposits in game account
    let game_account = &mut ctx.accounts.game_account;
    game_account.total_deposits = game_account
        .total_deposits
        .checked_add(amount)
        .ok_or(BettingError::ArithmeticOverflow)?;

    // Convert lamports to tokens (e.g., 1 SOL = 1000 tokens, 0.1 SOL = 100 tokens)
    let tokens = amount
        .checked_div(crate::state::LAMPORTS_PER_TOKEN)
        .ok_or(BettingError::ArithmeticOverflow)?;

    // Update user's virtual balance in proxy account
    let proxy_account = &mut ctx.accounts.proxy_account;
    proxy_account.balance = proxy_account
        .balance
        .checked_add(tokens)
        .ok_or(BettingError::ArithmeticOverflow)?;

    emit!(DepositEvent {
        user: *ctx.accounts.user.key,
        amount: tokens,
        new_balance: proxy_account.balance,
    });

    msg!(
        "Deposited {} lamports ({} tokens). New balance: {}",
        amount,
        tokens,
        proxy_account.balance
    );
    Ok(())
}
