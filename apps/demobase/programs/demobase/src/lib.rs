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
        ctx.accounts.collection.name = parse_string(name);
        ctx.accounts.collection.bump = bump;
        ctx.accounts.collection.authority = ctx.accounts.authority.key();
        ctx.accounts.collection.application = ctx.accounts.application.key();
        Ok(())
    }

    pub fn create_collection_attribute(ctx: Context<CreateCollectionAttribute>, name: String, kind: u8, modifier: u8, size: u8, bump: u8) -> ProgramResult {
        msg!("Create collection attribute");
        ctx.accounts.attribute.name = parse_string(name);
        ctx.accounts.attribute.bump = bump;
        ctx.accounts.attribute.kind = AttributeKind::from(kind)?;
        ctx.accounts.attribute.modifier = AttributeKindModifier::from(modifier, size)?;
        ctx.accounts.attribute.authority = ctx.accounts.authority.key();
        ctx.accounts.attribute.collection = ctx.accounts.collection.key();
        ctx.accounts.attribute.application = ctx.accounts.application.key();
        Ok(())
    }

    pub fn create_collection_instruction(ctx: Context<CreateCollectionInstruction>, name: String, bump: u8) -> ProgramResult {
        msg!("Create collection instruction");
        ctx.accounts.instruction.name = parse_string(name);
        ctx.accounts.instruction.bump = bump;
        ctx.accounts.instruction.authority = ctx.accounts.authority.key();
        ctx.accounts.instruction.collection = ctx.accounts.collection.key();
        ctx.accounts.instruction.application = ctx.accounts.application.key();
        Ok(())
    }

    pub fn create_collection_instruction_argument(ctx: Context<CreateInstructionArgument>, name: String, kind: u8, modifier: u8, size: u8, bump: u8) -> ProgramResult {
        msg!("Create collection instruction argument");
        ctx.accounts.argument.name = parse_string(name);
        ctx.accounts.argument.kind = AttributeKind::from(kind)?;
        ctx.accounts.argument.modifier = AttributeKindModifier::from(modifier, size)?;
        ctx.accounts.argument.bump = bump;
        ctx.accounts.argument.authority = ctx.accounts.authority.key();
        ctx.accounts.argument.instruction = ctx.accounts.instruction.key();
        ctx.accounts.argument.collection = ctx.accounts.collection.key();
        ctx.accounts.argument.application = ctx.accounts.application.key();
        Ok(())
    }

    pub fn create_collection_instruction_account(ctx: Context<CreateInstructionAccount>, name: String, kind: u8, bump: u8) -> ProgramResult {
        msg!("Create collection instruction account");
        ctx.accounts.account.name = parse_string(name);
        ctx.accounts.account.kind = AccountKind::from(kind)?;
        ctx.accounts.account.bump = bump;
        ctx.accounts.account.authority = ctx.accounts.authority.key();
        ctx.accounts.account.account_collection = ctx.accounts.account_collection.key();
        ctx.accounts.account.instruction = ctx.accounts.instruction.key();
        ctx.accounts.account.collection = ctx.accounts.collection.key();
        ctx.accounts.account.application = ctx.accounts.application.key();
        Ok(())
    }

    pub fn create_account_bool_attribute(ctx: Context<CreateAccountBoolAttribute>, kind: u8, bump: u8) -> ProgramResult {
        msg!("Create account bool attribute");
        ctx.accounts.attribute.kind = AccountBoolAttributeKind::from(kind)?;
        ctx.accounts.attribute.bump = bump;
        ctx.accounts.attribute.authority = ctx.accounts.authority.key();
        ctx.accounts.attribute.account = ctx.accounts.account.key();
        ctx.accounts.attribute.instruction = ctx.accounts.instruction.key();
        ctx.accounts.attribute.collection = ctx.accounts.collection.key();
        ctx.accounts.attribute.application = ctx.accounts.application.key();
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
        space = 8 + 32 + 32 + 32 + 1,
        seeds = [
            b"collection",
            application.key().as_ref(),
            name.as_bytes()
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
#[instruction(name: String, kind: u8, modifier: u8, size: u8, bump: u8)]
pub struct CreateCollectionAttribute<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 2 + 2 + 1,
        seeds = [
            b"collection_attribute",
            application.key().as_ref(),
            collection.key().as_ref(),
            name.as_bytes()
        ],
        bump = bump
    )]
    pub attribute: Box<Account<'info, CollectionAttribute>>,
    pub application: Box<Account<'info, Application>>,
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
        space = 8 + 32 + 32 + 32 + 32 + 1,
        seeds = [
            b"collection_instruction",
            application.key().as_ref(),
            collection.key().as_ref(),
            name.as_bytes()
        ],
        bump = bump
    )]
    pub instruction: Box<Account<'info, CollectionInstruction>>,
    pub application: Box<Account<'info, Application>>,
    pub collection: Box<Account<'info, Collection>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, kind: u8, modifier: u8, array_size: u8, bump: u8)]
pub struct CreateInstructionArgument<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 32 + 2 + 2 + 1,
        seeds = [
            b"instruction_argument",
            application.key().as_ref(),
            collection.key().as_ref(),
            instruction.key().as_ref(),
            name.as_bytes()
        ],
        bump = bump
    )]
    pub argument: Box<Account<'info, InstructionArgument>>,
    pub application: Box<Account<'info, Application>>,
    pub collection: Box<Account<'info, Collection>>,
    pub instruction: Box<Account<'info, CollectionInstruction>>,
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
        space = 8 + 32 + 32 + 32 + 32 + 32 + 32 + 2 + 1,
        seeds = [
            b"instruction_account",
            application.key().as_ref(),
            collection.key().as_ref(),
            instruction.key().as_ref(),
            name.as_bytes()
        ],
        bump = bump
    )]
    pub account: Box<Account<'info, InstructionAccount>>,
    pub application: Box<Account<'info, Application>>,
    pub collection: Box<Account<'info, Collection>>,
    pub instruction: Box<Account<'info, CollectionInstruction>>,
    pub account_collection: Box<Account<'info, Collection>>,
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
        space = 8 + 32 + 32 + 32 + 32 + 32 + 2 + 1,
        seeds = [
            b"account_bool_attribute",
            application.key().as_ref(),
            collection.key().as_ref(),
            instruction.key().as_ref(),
            account.key().as_ref()
        ],
        bump = bump
    )]
    pub attribute: Box<Account<'info, AccountBoolAttribute>>,
    pub application: Box<Account<'info, Application>>,
    pub collection: Box<Account<'info, Collection>>,
    pub instruction: Box<Account<'info, CollectionInstruction>>,
    pub account: Box<Account<'info, InstructionAccount>>,
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
    pub application: Pubkey,
    pub name: [u8; 32],
    pub bump: u8,
}

#[account]
pub struct CollectionAttribute {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub collection: Pubkey,
    pub name: [u8; 32],
    pub kind: AttributeKind,
    pub modifier: AttributeKindModifier,
    pub bump: u8,
}

#[account]
pub struct CollectionInstruction {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub collection: Pubkey,
    pub name: [u8; 32],
    pub bump: u8,
}

#[account]
pub struct InstructionArgument {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub collection: Pubkey,
    pub instruction: Pubkey,
    pub name: [u8; 32],
    pub kind: AttributeKind,
    pub modifier: AttributeKindModifier,
    pub bump: u8,
}

#[account]
pub struct InstructionAccount {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub collection: Pubkey,
    pub instruction: Pubkey,
    pub name: [u8; 32],
    pub account_collection: Pubkey,
    pub kind: AccountKind,
    pub bump: u8,
}

#[account]
pub struct AccountBoolAttribute {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub collection: Pubkey,
    pub instruction: Pubkey,
    pub account: Pubkey,
    pub kind: AccountBoolAttributeKind,
    pub bump: u8,
}

pub fn parse_string(string: String) -> [u8; 32] {
    let src = string.as_bytes();
    let mut data = [0u8; 32];
    data[..src.len()].copy_from_slice(src);
    return data;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AttributeKind {
    U8 {
      size: u8
    },
    U16 {
      size: u8
    },
    U32 {
      size: u8
    },
    U64 {
      size: u8
    },
    U128 {
      size: u8
    },
    Pubkey {
      size: u8
    },
}

impl AttributeKind {
    fn from(index: u8) -> Result<Self> {
        match index {
            0 => Ok(AttributeKind::U8 { size: 1 }),
            1 => Ok(AttributeKind::U16 { size: 2 }),
            2 => Ok(AttributeKind::U32 { size: 4 }),
            3 => Ok(AttributeKind::U64 { size: 8 }),
            4 => Ok(AttributeKind::U128 { size: 16 }),
            5 => Ok(AttributeKind::Pubkey { size: 32 }),
            _ => Err(ErrorCode::InvalidAttributeKind.into()),
        }
    }
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AttributeKindModifier {
    None {
      size: u8
    },
    Array {
      size: u8
    },
    Vector {
      size: u8
    }
}

impl AttributeKindModifier {
    fn from(index: u8, size: u8) -> Result<Self> {
        match index {
            0 => Ok(AttributeKindModifier::None { size: 1 }),
            1 => Ok(AttributeKindModifier::Array { size: size }),
            2 => Ok(AttributeKindModifier::Vector { size: 1 }),
            _ => Err(ErrorCode::InvalidAttributeKindModifier.into()),
        }
    }
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
    #[msg("Invalid attribute kind")]
    InvalidAttributeKind,
    #[msg("Invalid attribute kind modifier")]
    InvalidAttributeKindModifier,
    #[msg("Invalid account kind")]
    InvalidAccountKind,
    #[msg("Invalid account attribute kind")]
    InvalidAccountAttributeKind,
}
