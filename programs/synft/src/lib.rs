use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod synft {
    use super::*;
    pub fn initialize_inject(ctx: Context<InitializeInject>) -> Result<()> {
        Ok(())
    }

    pub fn inject(ctx: Context<Inject>) -> Result<()>  {
        // TODO
        Ok(())
    }

    pub fn extract(ctx: Context<Extract>) -> Result<()>  {
        // TODO
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeInject {
    // TODO
}

#[derive(Accounts)]
pub struct Inject {
    // TODO
}

#[derive(Accounts)]
pub struct Extract {
    // TODO
}

#[error_code]
pub enum ErrorCode {
    #[msg("TODO: error message")]
    Error,
}