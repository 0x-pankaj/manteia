use anchor_lang::prelude::*;
use crate::state::{ProxyAccount, Bet, MAX_ACTIVE_BETS};


#[derive(Accounts)]
    pub struct CreateProxyAccount<'info> {
        #[account(
            init,
            payer = user,
            space = 8 + ProxyAccount::SPACE,
            seeds = [b"proxy", user.key().as_ref()],
            bump
        )]
        pub proxy_account: Account<'info, ProxyAccount>,
        
        #[account(mut)]
        pub user: Signer<'info>,
        
        pub system_program: Program<'info, System>,
    }

    pub fn create_proxy_account(ctx: Context<CreateProxyAccount>) -> Result<()> {
        let proxy_account = &mut ctx.accounts.proxy_account;
        
        proxy_account.owner = *ctx.accounts.user.key;
        proxy_account.balance = 0;
        proxy_account.total_bets_placed = 0;
        proxy_account.active_bet_count = 0;
        proxy_account.bets = [Bet::default(); MAX_ACTIVE_BETS];
        
        msg!("Proxy account created for user: {}", ctx.accounts.user.key);
        Ok(())
    }