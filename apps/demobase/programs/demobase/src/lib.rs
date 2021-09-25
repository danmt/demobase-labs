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
        msg!("Create collection instruction argument");
        ctx.accounts.collection_instruction_argument.name = parse_string(name);
        ctx.accounts.collection_instruction_argument.argument_type = parse_string(argument_type);
        ctx.accounts.collection_instruction_argument.bump = bump;
        ctx.accounts.collection_instruction_argument.authority = ctx.accounts.authority.key();
        ctx.accounts.collection_instruction_argument.collection_instruction = ctx.accounts.collection_instruction.key();
        Ok(())
    }

    pub fn create_collection_instruction_account(ctx: Context<CreateInstructionAccount>, name: String, kind: u8, bump: u8) -> ProgramResult {
        msg!("Create collection instruction account");
        ctx.accounts.account.name = parse_string(name);
        ctx.accounts.account.kind = AccountKind::from(kind)?;
        ctx.accounts.account.bump = bump;
        ctx.accounts.account.authority = ctx.accounts.authority.key();
        ctx.accounts.account.instruction = ctx.accounts.instruction.key();
        ctx.accounts.account.collection = ctx.accounts.collection.key();
        Ok(())
    }

    pub fn create_account_bool_attribute(ctx: Context<CreateAccountBoolAttribute>, kind: u8, bump: u8) -> ProgramResult {
        msg!("Create account bool attribute");
        ctx.accounts.attribute.bump = bump;
        ctx.accounts.attribute.kind = AccountBoolAttributeKind::from(kind)?;
        ctx.accounts.attribute.account = ctx.accounts.account.key();
        ctx.accounts.attribute.instruction = ctx.accounts.instruction.key();
        ctx.accounts.attribute.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn update_account_bool_attribute(ctx: Context<UpdateAccountBoolAttribute>, kind: u8) -> ProgramResult {
        msg!("Update account bool attribute");
        ctx.accounts.attribute.kind = AccountBoolAttributeKind::from(kind)?;
        Ok(())
    }

    pub fn delete_account_bool_attribute(_ctx: Context<DeleteAccountBoolAttribute>) -> ProgramResult {
        msg!("Delete account bool attribute");
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

#[derive(Accounts)]
#[instruction(name: String, kind: u8, bump: u8)]
pub struct CreateInstructionAccount<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 32 + 32 + 32 + 1,
        seeds = [
            b"instruction_account",
            instruction.key().as_ref(),
            name.as_bytes()
        ],
        bump = bump
    )]
    pub account: Box<Account<'info, InstructionAccount>>,
    pub instruction: Box<Account<'info, CollectionInstruction>>,
    pub collection: Box<Account<'info, Collection>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(kind: u8, bump: u8)]
pub struct CreateAccountBoolAttribute<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 32 + 32 + 1,
        seeds = [
            b"account_bool_attribute",
            account.key().as_ref()
        ],
        bump = bump
    )]
    pub attribute: Box<Account<'info, AccountBoolAttribute>>,
    pub account: Box<Account<'info, InstructionAccount>>,
    pub instruction: Box<Account<'info, CollectionInstruction>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(kind: u8)]
pub struct UpdateAccountBoolAttribute<'info> {
    #[account(mut, has_one = authority)]
    pub attribute: Box<Account<'info, AccountBoolAttribute>>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteAccountBoolAttribute<'info> {
    #[account(mut, close = authority, has_one = authority)]
    pub attribute: Account<'info, AccountBoolAttribute>,
    pub authority: Signer<'info>,
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

#[account]
pub struct InstructionAccount {
    pub authority: Pubkey,
    pub bump: u8,
    pub collection: Pubkey,
    pub instruction: Pubkey,
    pub name: [u8; 32],
    pub kind: AccountKind,
}

#[account]
pub struct AccountBoolAttribute {
    pub authority: Pubkey,
    pub bump: u8,
    pub instruction: Pubkey,
    pub account: Pubkey,
    pub kind: AccountBoolAttributeKind,
}

pub fn parse_string(string: String) -> [u8; 32] {
    let src = string.as_bytes();
    let mut data = [0u8; 32];
    data[..src.len()].copy_from_slice(src);
    return data;
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AccountKind {
    Account,
    Signer,
    Program,
}

impl AccountKind {
    fn from(index: u8) -> Result<Self> {
        match index {
            0 => Ok(AccountKind::Account),
            1 => Ok(AccountKind::Signer),
            2 => Ok(AccountKind::Program),
            _ => Err(ErrorCode::InvalidAccountKind.into()),
        }
    }
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AccountBoolAttributeKind {
    Init,
    Mut,
    Zero,
}

impl AccountBoolAttributeKind {
    fn from(index: u8) -> Result<Self> {
        match index {
            0 => Ok(AccountBoolAttributeKind::Init),
            1 => Ok(AccountBoolAttributeKind::Mut),
            2 => Ok(AccountBoolAttributeKind::Zero),
            _ => Err(ErrorCode::InvalidAccountAttributeKind.into()),
        }
    }
}

#[error]
pub enum ErrorCode {
    #[msg("Invalid account kind")]
    InvalidAccountKind,
    #[msg("Invalid account attribute kind")]
    InvalidAccountAttributeKind,
}
