use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::{commit, delegate, ephemeral};
use ephemeral_rollups_sdk::cpi::DelegateConfig;
use ephemeral_rollups_sdk::ephem::{commit_accounts, commit_and_undelegate_accounts};

pub mod instructions;
pub mod state;
pub mod errors;
pub mod events;

use instructions::*;
use crate::state::ProxyAccount;

declare_id!("HCvWBZpYDeiTMUaSmCRm5jP67M6wYV2NDBjAG4qdDLNE");

#[ephemeral]
#[program]
pub mod manteia_contract {

    use super::*;

    pub fn create_proxy_account(ctx: Context<CreateProxyAccount>) -> Result<()> {
        instructions::create_proxy_account::create_proxy_account(ctx)
    }
    
    pub fn delegate_proxy_account(
        ctx: Context<DelegateProxyAccount>
    ) -> Result<()> {
        ctx.accounts.delegate_pda(&ctx.accounts.payer, &[b"proxy", ctx.accounts.payer.key().as_ref()], 
        // DelegateConfig { commit_frequency_ms: (), validator: () }
        DelegateConfig {
                validator: ctx.remaining_accounts.first().map(|acc| acc.key()),
                ..Default::default()
            }
    )?;
        Ok(())
    }


    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit::deposit(ctx, amount)
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
        instructions::place_bet::place_bet(
            ctx,
            amount,
            target_price_range_start,
            target_price_range_end,
            prediction_start_time,
            prediction_end_time,
            payout_multiplier
        )
    }


    pub fn resolve_bet(
        ctx: Context<ResolveBet>,
        bet_id: u64,
        won: bool,
        payout_amount: u64,
    ) -> Result<()> {
        instructions::resolve_bet::resolve_bet(ctx, bet_id, won, payout_amount)
    }

    pub fn commit_state(ctx: Context<CommitState>) -> Result<()> {

            commit_accounts(&ctx.accounts.payer,
                 vec![&ctx.accounts.proxy_account.to_account_info()],
                  &ctx.accounts.magic_context,
                   &ctx.accounts.magic_program
                )?;

        Ok(())
    }

    pub fn commit_and_undelegate_account(ctx: Context<CommitState>) -> Result<()> {
        commit_and_undelegate_accounts(&ctx.accounts.payer,
             vec![&ctx.accounts.proxy_account.to_account_info()],
              &ctx.accounts.magic_context,
               &ctx.accounts.magic_program
            )?;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        instructions::withdraw::withdraw(ctx, amount)
    }
}

#[delegate]
#[derive(Accounts)]
pub struct DelegateProxyAccount<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This account is the PDA to be delegated to the ephemeral rollup
    #[account(mut, del)]
    pub pda: AccountInfo<'info>,
    /// CHECK: PDA authority is verified by the ephemeral rollup SDK
    pub pda_authority: AccountInfo<'info>,
}

#[commit]
#[derive(Accounts)]
pub struct CommitState<'info> {
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"proxy", payer.key().as_ref()],
        bump
    )]
      pub proxy_account: Account<'info, ProxyAccount>,
    
    /// CHECK: Magic context account verified by ephemeral rollup SDK
    pub magic_context: AccountInfo<'info>,
    
    /// CHECK: Magic program account verified by ephemeral rollup SDK
    pub magic_program: AccountInfo<'info>,
}