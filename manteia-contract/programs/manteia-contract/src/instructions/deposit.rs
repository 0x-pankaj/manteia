use anchor_lang::prelude::*;
use crate::events::DepositEvent;
use crate::state::ProxyAccount;
use crate::errors::BettingError;

    #[derive(Accounts)]
    pub struct Deposit<'info> {
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
        let cpi_to   = ctx.accounts.proxy_account.to_account_info();
        let proxy_account = &mut ctx.accounts.proxy_account;
        
        // Transfer SOL from user to proxy account
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: cpi_to,
            },
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;

        // Update balance
        proxy_account.balance = proxy_account
            .balance
            .checked_add(amount)
            .ok_or(BettingError::ArithmeticOverflow)?;

        emit!(DepositEvent {
            user: *ctx.accounts.user.key,
            amount,
            new_balance: proxy_account.balance,
        });

        msg!("Deposited {} lamports. New balance: {}", amount, proxy_account.balance);
        Ok(())
    }