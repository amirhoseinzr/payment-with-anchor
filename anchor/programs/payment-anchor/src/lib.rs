use anchor_lang::prelude::*;

declare_id!("pid ");

#[program]
pub mod solana_payment_app {
  use super::*;

  pub fn initialize_shop(ctx: Context<InitializeShop>, shop_name: String) -> Result<()> {
    let shop = &mut ctx.accounts.shop;
    shop.owner = *ctx.accounts.owner.key;
    shop.shop_name = shop_name;
    Ok(())
  }

  pub fn add_item(ctx: Context<AddItem>, name: String, price: u64) -> Result<()> {
    let shop = &mut ctx.accounts.shop;
    let item = Item { name, price };
    shop.items.push(item);
    Ok(())
  }

  pub fn purchase_item(ctx: Context<PurchaseItem>, item_index: u8) -> Result<()> {
    let shop = &mut ctx.accounts.shop;
    let item = &shop.items[item_index as usize];

    let customer = &mut ctx.accounts.customer;
    let shop_owner = &mut ctx.accounts.owner;

    // Transfer SOL from customer to shop owner
    let ix = anchor_lang::solana_program::system_instruction::transfer(
      &customer.key(),
      &shop_owner.key(),
      item.price,
    );
    anchor_lang::solana_program::program::invoke(
      &ix,
      &[
        customer.to_account_info(),
        shop_owner.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
      ],
    )?;

    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeShop<'info> {
  #[account(init, payer = owner, space = 8 + 32 + 64 + 1000)] // Adjust space accordingly
  pub shop: Account<'info, Shop>,
  #[account(mut)]
  pub owner: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddItem<'info> {
  #[account(mut, has_one = owner)]
  pub shop: Account<'info, Shop>,
  pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct PurchaseItem<'info> {
  #[account(mut)]
  pub shop: Account<'info, Shop>,
  #[account(mut)]
  pub customer: Signer<'info>,
  #[account(mut)]
  pub owner: AccountInfo<'info>,
  pub system_program: Program<'info, System>,
}

#[account]
pub struct Shop {
  pub owner: Pubkey,
  pub shop_name: String,
  pub items: Vec<Item>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Item {
  pub name: String,
  pub price: u64,
}
