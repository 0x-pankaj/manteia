use crate::errors::BettingError;
use crate::events::WithdrawEvent;
use crate::state::{GameAccount, ProxyAccount};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Withdraw<'info> {
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
}

pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let proxy_account = &mut ctx.accounts.proxy_account;

    require!(amount > 0, BettingError::InvalidBetAmount);
    require!(
        proxy_account.balance >= amount,
        BettingError::InsufficientBalance
    );

    // Update user's virtual balance (amount is in tokens)
    proxy_account.balance = proxy_account
        .balance
        .checked_sub(amount)
        .ok_or(BettingError::ArithmeticOverflow)?;

    // Convert tokens to lamports for actual SOL transfer
    let lamports = amount
        .checked_mul(crate::state::LAMPORTS_PER_TOKEN)
        .ok_or(BettingError::ArithmeticOverflow)?;

    // Update game account total deposits
    let game_account = &mut ctx.accounts.game_account;
    game_account.total_deposits = game_account
        .total_deposits
        .checked_sub(lamports)
        .ok_or(BettingError::ArithmeticOverflow)?;

    // Transfer SOL from game account to user
    **game_account.to_account_info().try_borrow_mut_lamports()? -= lamports;
    **ctx
        .accounts
        .user
        .to_account_info()
        .try_borrow_mut_lamports()? += lamports;

    emit!(WithdrawEvent {
        user: *ctx.accounts.user.key,
        amount,
        new_balance: proxy_account.balance,
    });

    msg!(
        "Withdrawn {} tokens ({} lamports). New balance: {}",
        amount,
        lamports,
        proxy_account.balance
    );
    Ok(())
}
