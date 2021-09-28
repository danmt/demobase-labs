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

    pub fn update_application(ctx: Context<UpdateApplication>, name: String) -> ProgramResult {
        msg!("Update application");
        ctx.accounts.application.name = parse_string(name);
        Ok(())
    }

    pub fn delete_application(_ctx: Context<DeleteApplication>) -> ProgramResult {
        msg!("Delete application");
        Ok(())
    }

    pub fn create_collection(ctx: Context<CreateCollection>, name: String) -> ProgramResult {
        msg!("Create collection");
        ctx.accounts.collection.name = parse_string(name);
        ctx.accounts.collection.authority = ctx.accounts.authority.key();
        ctx.accounts.collection.application = ctx.accounts.application.key();
        Ok(())
    }

    pub fn update_collection(ctx: Context<UpdateCollection>, name: String) -> ProgramResult {
        msg!("Update collection");
        ctx.accounts.collection.name = parse_string(name);
        Ok(())
    }

    pub fn delete_collection(_ctx: Context<DeleteCollection>) -> ProgramResult {
        msg!("Delete collection");
        Ok(())
    }

    pub fn create_collection_attribute(ctx: Context<CreateCollectionAttribute>, name: String, kind: u8, modifier: u8, size: u8) -> ProgramResult {
        msg!("Create collection attribute");
        ctx.accounts.attribute.name = parse_string(name);
        ctx.accounts.attribute.kind = AttributeKind::from(kind)?;
        ctx.accounts.attribute.modifier = AttributeKindModifier::from(modifier, size)?;
        ctx.accounts.attribute.authority = ctx.accounts.authority.key();
        ctx.accounts.attribute.collection = ctx.accounts.collection.key();
        ctx.accounts.attribute.application = ctx.accounts.application.key();
        Ok(())
    }

    pub fn update_collection_attribute(ctx: Context<UpdateCollectionAttribute>, name: String, kind: u8, modifier: u8, size: u8) -> ProgramResult {
        msg!("Update collection attribute");
        ctx.accounts.attribute.name = parse_string(name);
        ctx.accounts.attribute.kind = AttributeKind::from(kind)?;
        ctx.accounts.attribute.modifier = AttributeKindModifier::from(modifier, size)?;
        Ok(())
    }

    pub fn delete_collection_attribute(_ctx: Context<DeleteCollectionAttribute>) -> ProgramResult {
        msg!("Delete collection attribute");
        Ok(())
    }

    pub fn create_collection_instruction(ctx: Context<CreateCollectionInstruction>, name: String) -> ProgramResult {
        msg!("Create collection instruction");
        ctx.accounts.instruction.name = parse_string(name);
        ctx.accounts.instruction.authority = ctx.accounts.authority.key();
        ctx.accounts.instruction.collection = ctx.accounts.collection.key();
        ctx.accounts.instruction.application = ctx.accounts.application.key();
        Ok(())
    }

    pub fn update_collection_instruction(ctx: Context<UpdateCollectionInstruction>, name: String) -> ProgramResult {
        msg!("Update collection instruction");
        ctx.accounts.instruction.name = parse_string(name);
        Ok(())
    }

    pub fn delete_collection_instruction(_ctx: Context<DeleteCollectionInstruction>) -> ProgramResult {
        msg!("Delete collection instruction");
        Ok(())
    }

    pub fn create_collection_instruction_argument(ctx: Context<CreateInstructionArgument>, name: String, kind: u8, modifier: u8, size: u8) -> ProgramResult {
        msg!("Create collection instruction argument");
        ctx.accounts.argument.name = parse_string(name);
        ctx.accounts.argument.kind = AttributeKind::from(kind)?;
        ctx.accounts.argument.modifier = AttributeKindModifier::from(modifier, size)?;
        ctx.accounts.argument.authority = ctx.accounts.authority.key();
        ctx.accounts.argument.instruction = ctx.accounts.instruction.key();
        ctx.accounts.argument.collection = ctx.accounts.collection.key();
        ctx.accounts.argument.application = ctx.accounts.application.key();
        Ok(())
    }

    pub fn update_collection_instruction_argument(ctx: Context<UpdateInstructionArgument>, name: String, kind: u8, modifier: u8, size: u8) -> ProgramResult {
        msg!("Update collection instruction argument");
        ctx.accounts.argument.name = parse_string(name);
        ctx.accounts.argument.kind = AttributeKind::from(kind)?;
        ctx.accounts.argument.modifier = AttributeKindModifier::from(modifier, size)?;
        Ok(())
    }

    pub fn delete_collection_instruction_argument(_ctx: Context<DeleteInstructionArgument>) -> ProgramResult {
        msg!("Delete collection instruction argument");
        Ok(())
    }

    pub fn create_collection_instruction_account(ctx: Context<CreateInstructionAccount>, name: String, kind: u8, mark_attribute: u8) -> ProgramResult {
        msg!("Create collection instruction account");
        ctx.accounts.account.name = parse_string(name);
        ctx.accounts.account.kind = AccountKind::from(kind)?;
        ctx.accounts.account.mark_attribute = MarkAttribute::from(mark_attribute)?;
        ctx.accounts.account.authority = ctx.accounts.authority.key();
        ctx.accounts.account.account_collection = ctx.accounts.account_collection.key();
        ctx.accounts.account.instruction = ctx.accounts.instruction.key();
        ctx.accounts.account.collection = ctx.accounts.collection.key();
        ctx.accounts.account.application = ctx.accounts.application.key();
        Ok(())
    }

    pub fn update_collection_instruction_account(ctx: Context<UpdateInstructionAccount>, name: String, kind: u8, mark_attribute: u8) -> ProgramResult {
        msg!("Update collection instruction account");
        ctx.accounts.account.name = parse_string(name);
        ctx.accounts.account.kind = AccountKind::from(kind)?;
        ctx.accounts.account.mark_attribute = MarkAttribute::from(mark_attribute)?;
        ctx.accounts.account.account_collection = ctx.accounts.account_collection.key();
        Ok(())
    }

    pub fn delete_collection_instruction_account(_ctx: Context<DeleteInstructionAccount>) -> ProgramResult {
        msg!("Delete collection instruction account");
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
#[instruction(name: String)]
pub struct UpdateApplication<'info> {
    #[account(mut, has_one = authority)]
    pub application: Box<Account<'info, Application>>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteApplication<'info> {
    #[account(mut, has_one = authority, close = authority)]
    pub application: Account<'info, Application>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateCollection<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32
    )]
    pub collection: Box<Account<'info, Collection>>,
    pub application: Box<Account<'info, Application>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateCollection<'info> {
    #[account(mut, has_one = authority)]
    pub collection: Box<Account<'info, Collection>>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteCollection<'info> {
    #[account(mut, has_one = authority, close = authority)]
    pub collection: Account<'info, Collection>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(name: String, kind: u8, modifier: u8, size: u8)]
pub struct CreateCollectionAttribute<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 3 + 3
    )]
    pub attribute: Box<Account<'info, CollectionAttribute>>,
    pub application: Box<Account<'info, Application>>,
    pub collection: Box<Account<'info, Collection>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, kind: u8, modifier: u8, size: u8)]
pub struct UpdateCollectionAttribute<'info> {
    #[account(mut, has_one = authority)]
    pub attribute: Account<'info, CollectionAttribute>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteCollectionAttribute<'info> {
    #[account(mut, has_one = authority, close = authority)]
    pub attribute: Account<'info, CollectionAttribute>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateCollectionInstruction<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32
    )]
    pub instruction: Box<Account<'info, CollectionInstruction>>,
    pub application: Box<Account<'info, Application>>,
    pub collection: Box<Account<'info, Collection>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateCollectionInstruction<'info> {
    #[account(mut, has_one = authority)]
    pub instruction: Box<Account<'info, CollectionInstruction>>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteCollectionInstruction<'info> {
    #[account(mut, has_one = authority, close = authority)]
    pub instruction: Account<'info, CollectionInstruction>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(name: String, kind: u8, modifier: u8, array_size: u8)]
pub struct CreateInstructionArgument<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 32 + 3 + 3,
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
#[instruction(name: String, kind: u8, modifier: u8, array_size: u8)]
pub struct UpdateInstructionArgument<'info> {
    #[account(mut, has_one = authority)]
    pub argument: Box<Account<'info, InstructionArgument>>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteInstructionArgument<'info> {
    #[account(mut, has_one = authority, close = authority)]
    pub argument: Account<'info, InstructionArgument>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(name: String, kind: u8, mark_attribute: u8)]
pub struct CreateInstructionAccount<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 32 + 32 + 2 + 2
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
#[instruction(name: String, kind: u8, mark_attribute: u8)]
pub struct UpdateInstructionAccount<'info> {
    #[account(mut, has_one = authority)]
    pub account: Box<Account<'info, InstructionAccount>>,
    pub account_collection: Box<Account<'info, Collection>>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteInstructionAccount<'info> {
    #[account(mut, close = authority, has_one = authority)]
    pub account: Account<'info, InstructionAccount>,
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
}

#[account]
pub struct CollectionAttribute {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub collection: Pubkey,
    pub name: [u8; 32],
    pub kind: AttributeKind,
    pub modifier: AttributeKindModifier,
}

#[account]
pub struct CollectionInstruction {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub collection: Pubkey,
    pub name: [u8; 32],
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
    pub mark_attribute: MarkAttribute,
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
      id: u8,
      size: u8
    },
    U16 {
      id: u8,
      size: u8
    },
    U32 {
      id: u8,
      size: u8
    },
    U64 {
      id: u8,
      size: u8
    },
    U128 {
      id: u8,
      size: u8
    },
    Pubkey {
      id: u8,
      size: u8
    },
}

impl AttributeKind {
    fn from(index: u8) -> Result<Self> {
        match index {
            0 => Ok(AttributeKind::U8 { id: 0, size: 1 }),
            1 => Ok(AttributeKind::U16 { id: 1, size: 2 }),
            2 => Ok(AttributeKind::U32 { id: 2, size: 4 }),
            3 => Ok(AttributeKind::U64 { id: 3, size: 8 }),
            4 => Ok(AttributeKind::U128 { id: 4, size: 16 }),
            5 => Ok(AttributeKind::Pubkey { id: 5, size: 32 }),
            _ => Err(ErrorCode::InvalidAttributeKind.into()),
        }
    }
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AttributeKindModifier {
    None {
      id: u8,
      size: u8
    },
    Array {
      id: u8,
      size: u8
    },
    Vector {
      id: u8,
      size: u8
    }
}

impl AttributeKindModifier {
    fn from(index: u8, size: u8) -> Result<Self> {
        match index {
            0 => Ok(AttributeKindModifier::None { id: 0, size: 1 }),
            1 => Ok(AttributeKindModifier::Array { id: 1, size: size }),
            2 => Ok(AttributeKindModifier::Vector { id: 2, size: 1 }),
            _ => Err(ErrorCode::InvalidAttributeModifier.into()),
        }
    }
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AccountKind {
    Account {
        id: u8
    },
    Signer {
        id: u8
    },
    Program {
        id: u8
    },
}

impl AccountKind {
    fn from(index: u8) -> Result<Self> {
        match index {
            0 => Ok(AccountKind::Account{ id: 0 }),
            1 => Ok(AccountKind::Signer{ id: 1 }),
            2 => Ok(AccountKind::Program{ id: 2 }),
            _ => Err(ErrorCode::InvalidAccountKind.into()),
        }
    }
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum MarkAttribute {
    None {
        id: u8
    },
    Init {
        id: u8
    },
    Mut {
        id: u8
    },
    Zero {
        id: u8
    },
}

impl MarkAttribute {
    fn from(index: u8) -> Result<Self> {
        match index {
            0 => Ok(MarkAttribute::None{ id: 0 }),
            1 => Ok(MarkAttribute::Init{ id: 1 }),
            2 => Ok(MarkAttribute::Mut{ id: 2 }),
            3 => Ok(MarkAttribute::Zero{ id: 3 }),
            _ => Err(ErrorCode::InvalidMarkAttribute.into()),
        }
    }
}

#[error]
pub enum ErrorCode {
    #[msg("Invalid attribute kind")]
    InvalidAttributeKind,
    #[msg("Invalid attribute modifier")]
    InvalidAttributeModifier,
    #[msg("Invalid account kind")]
    InvalidAccountKind,
    #[msg("Invalid mark attribute")]
    InvalidMarkAttribute,
}
