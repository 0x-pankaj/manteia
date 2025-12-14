use anchor_lang::prelude::*;

declare_id!("HCvWBZpYDeiTMUaSmCRm5jP67M6wYV2NDBjAG4qdDLNE");

#[program]
pub mod manteia_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
