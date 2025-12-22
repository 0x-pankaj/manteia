use crate::state::GameAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeGameAccount<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + GameAccount::SPACE,
        seeds = [GameAccount::SEED],
        bump
    )]
    pub game_account: Account<'info, GameAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_game_account(ctx: Context<InitializeGameAccount>) -> Result<()> {
    let game_account = &mut ctx.accounts.game_account;

    game_account.authority = *ctx.accounts.authority.key;
    game_account.total_deposits = 0;
    game_account.bump = ctx.bumps.game_account;

    msg!(
        "Game account initialized. Authority: {}",
        ctx.accounts.authority.key
    );
    Ok(())
}
