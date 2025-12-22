use crate::errors::BettingError;
use crate::state::ProxyAccount;
use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::commit;
use ephemeral_rollups_sdk::ephem::commit_accounts;

pub fn claim_and_commit(ctx: Context<ClaimAndCommit>) -> Result<()> {
    let proxy_account = &mut ctx.accounts.proxy_account;

    //update unclaimed balance
    let unclaimed_amount = proxy_account.unclaimed_balance;
    require!(unclaimed_amount > 0, BettingError::NoUnclaimedBalance);

    //update balance
    proxy_account.balance = proxy_account
        .balance
        .checked_add(unclaimed_amount)
        .ok_or(BettingError::ArithmeticOverflow)?;

    //update unclaimed balance
    proxy_account.unclaimed_balance = 0;

    ctx.accounts.proxy_account.exit(&crate::ID)?;

    commit_accounts(
        &ctx.accounts.user,
        vec![&ctx.accounts.proxy_account.to_account_info()],
        &ctx.accounts.magic_context,
        &ctx.accounts.magic_program,
    )?;

    Ok(())
}

#[commit]
#[derive(Accounts)]
pub struct ClaimAndCommit<'info> {
    #[account(
        mut,
        seeds = [b"proxy", user.key().as_ref()],
        bump,
        constraint = proxy_account.owner == *user.key @ crate::errors::BettingError::Unauthorized
    )]
    pub proxy_account: Account<'info, ProxyAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
}
