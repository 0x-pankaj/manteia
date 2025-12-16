use anchor_lang::prelude::*;
use crate::events::WithdrawEvent;
use crate::state::ProxyAccount;
use crate::errors::BettingError;


    #[derive(Accounts)]
    pub struct Withdraw<'info> {
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

        // Update balance
        proxy_account.balance = proxy_account
            .balance
            .checked_sub(amount)
            .ok_or(BettingError::ArithmeticOverflow)?;

        // Transfer SOL from proxy account to user
        **proxy_account.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += amount;

        emit!(WithdrawEvent {
            user: *ctx.accounts.user.key,
            amount,
            new_balance: proxy_account.balance,
        });

        msg!("Withdrawn {} lamports. New balance: {}", amount, proxy_account.balance);
        Ok(())
    }