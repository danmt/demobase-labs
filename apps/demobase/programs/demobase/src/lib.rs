use anchor_lang::prelude::*;

declare_id!("E4kBuz9gC7T32LBKnH3kscxjay1Y3KqFkXJt8UHq1BN4");

#[program]
pub mod demobase {
    use super::*;

    pub fn create_application(ctx: Context<CreateApplication>, name: String) -> ProgramResult {
        msg!("Create application");
        ctx.accounts.application.name = parse_string(name);
        ctx.accounts.application.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn create_collection(ctx: Context<CreateCollection>, name: String, bump: u8) -> ProgramResult {
        msg!("Create collection");
        ctx.accounts.collection.bump = bump;
        ctx.accounts.collection.name = parse_string(name);
        ctx.accounts.collection.authority = ctx.accounts.authority.key();
        ctx.accounts.collection.application = ctx.accounts.application.key();
        Ok(())
    }

    pub fn create_collection_attribute(ctx: Context<CreateCollectionAttribute>, name: String, attribute_type: String, size: u8, bump: u8) -> ProgramResult {
        msg!("Create collection attribute");
        ctx.accounts.collection_attribute.name = parse_string(name);
        ctx.accounts.collection_attribute.bump = bump;
        ctx.accounts.collection_attribute.attribute_type = parse_string(attribute_type);
        ctx.accounts.collection_attribute.size = size;
        ctx.accounts.collection_attribute.authority = ctx.accounts.authority.key();
        ctx.accounts.collection_attribute.collection = ctx.accounts.collection.key();
        Ok(())
    }

    pub fn create_collection_instruction(ctx: Context<CreateCollectionInstruction>, name: String, bump: u8) -> ProgramResult {
        msg!("Create collection instruction");
        ctx.accounts.collection_instruction.name = parse_string(name);
        ctx.accounts.collection_instruction.bump = bump;
        ctx.accounts.collection_instruction.authority = ctx.accounts.authority.key();
        ctx.accounts.collection_instruction.collection = ctx.accounts.collection.key();
        Ok(())
    }

    pub fn create_collection_instruction_argument(ctx: Context<CreateCollectionInstructionArgument>, name: String, argument_type: String, bump: u8) -> ProgramResult {
      msg!("Create collection instruction_argument");
      ctx.accounts.collection_instruction_argument.name = parse_string(name);
      ctx.accounts.collection_instruction_argument.argument_type = parse_string(argument_type);
      ctx.accounts.collection_instruction_argument.bump = bump;
      ctx.accounts.collection_instruction_argument.authority = ctx.accounts.authority.key();
      ctx.accounts.collection_instruction_argument.collection_instruction = ctx.accounts.collection_instruction.key();
      Ok(())
  }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateApplication<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32,
    )]
    pub application: Box<Account<'info, Application>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, bump: u8)]
pub struct CreateCollection<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 32 + 32,
        seeds = [
            b"collection",
            name.as_bytes(),
            application.key().as_ref()
        ],
        bump = bump
    )]
    pub collection: Box<Account<'info, Collection>>,
    pub application: Box<Account<'info, Application>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, attribute_type: String, size: u8, bump: u8)]
pub struct CreateCollectionAttribute<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 32 + 32 + 32 + 1,
        seeds = [
            b"collection_attribute",
            collection.key().as_ref(),
            name.as_bytes()
        ],
        bump = bump
    )]
    pub collection_attribute: Box<Account<'info, CollectionAttribute>>,
    pub collection: Box<Account<'info, Collection>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, bump: u8)]
pub struct CreateCollectionInstruction<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 32 + 32,
        seeds = [
            b"collection_instruction",
            collection.key().as_ref(),
            name.as_bytes()
        ],
        bump = bump
    )]
    pub collection_instruction: Box<Account<'info, CollectionInstruction>>,
    pub collection: Box<Account<'info, Collection>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, argument_type: String, bump: u8)]
pub struct CreateCollectionInstructionArgument<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 32 + 32 + 32,
        seeds = [
            b"collection_instruction_argument",
            collection_instruction.key().as_ref(),
            name.as_bytes()
        ],
        bump = bump
    )]
    pub collection_instruction_argument: Box<Account<'info, CollectionInstructionArgument>>,
    pub collection_instruction: Box<Account<'info, CollectionInstruction>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Application {
    pub authority: Pubkey,
    pub name: [u8; 32],
}

#[account]
pub struct Collection {
    pub authority: Pubkey,
    pub bump: u8,
    pub application: Pubkey,
    pub name: [u8; 32],
}

#[account]
pub struct CollectionAttribute {
    pub authority: Pubkey,
    pub bump: u8,
    pub collection: Pubkey,
    pub name: [u8; 32],
    pub attribute_type: [u8; 32],
    pub size: u8,
}

#[account]
pub struct CollectionInstruction {
    pub authority: Pubkey,
    pub bump: u8,
    pub collection: Pubkey,
    pub name: [u8; 32],
}

#[account]
pub struct CollectionInstructionArgument {
    pub authority: Pubkey,
    pub bump: u8,
    pub collection_instruction: Pubkey,
    pub name: [u8; 32],
    pub argument_type: [u8; 32],
}

pub fn parse_string(string: String) -> [u8; 32] {
    let src = string.as_bytes();
    let mut data = [0u8; 32];
    data[..src.len()].copy_from_slice(src);
    return data;
}
