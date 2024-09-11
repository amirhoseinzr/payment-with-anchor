import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { PaymentAnchor } from '../target/types/payment_anchor';

describe('payment-anchor', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.PaymentAnchor as Program<PaymentAnchor>;

  const paymentAnchorKeypair = Keypair.generate();

  it('Initialize PaymentAnchor', async () => {
    await program.methods
      .initialize()
      .accounts({
        paymentAnchor: paymentAnchorKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([paymentAnchorKeypair])
      .rpc();

    const currentCount = await program.account.paymentAnchor.fetch(
      paymentAnchorKeypair.publicKey
    );

    expect(currentCount.count).toEqual(0);
  });

  it('Increment PaymentAnchor', async () => {
    await program.methods
      .increment()
      .accounts({ paymentAnchor: paymentAnchorKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.paymentAnchor.fetch(
      paymentAnchorKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Increment PaymentAnchor Again', async () => {
    await program.methods
      .increment()
      .accounts({ paymentAnchor: paymentAnchorKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.paymentAnchor.fetch(
      paymentAnchorKeypair.publicKey
    );

    expect(currentCount.count).toEqual(2);
  });

  it('Decrement PaymentAnchor', async () => {
    await program.methods
      .decrement()
      .accounts({ paymentAnchor: paymentAnchorKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.paymentAnchor.fetch(
      paymentAnchorKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Set paymentAnchor value', async () => {
    await program.methods
      .set(42)
      .accounts({ paymentAnchor: paymentAnchorKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.paymentAnchor.fetch(
      paymentAnchorKeypair.publicKey
    );

    expect(currentCount.count).toEqual(42);
  });

  it('Set close the paymentAnchor account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        paymentAnchor: paymentAnchorKeypair.publicKey,
      })
      .rpc();

    // The account should no longer exist, returning null.
    const userAccount = await program.account.paymentAnchor.fetchNullable(
      paymentAnchorKeypair.publicKey
    );
    expect(userAccount).toBeNull();
  });
});
