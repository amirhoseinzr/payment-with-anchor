// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import PaymentAnchorIDL from '../target/idl/payment_anchor.json';
import type { PaymentAnchor } from '../target/types/payment_anchor';

// Re-export the generated IDL and type
export { PaymentAnchor, PaymentAnchorIDL };

// The programId is imported from the program IDL.
export const PAYMENT_ANCHOR_PROGRAM_ID = new PublicKey(
  PaymentAnchorIDL.address
);

// This is a helper function to get the PaymentAnchor Anchor program.
export function getPaymentAnchorProgram(provider: AnchorProvider) {
  return new Program(PaymentAnchorIDL as PaymentAnchor, provider);
}

// This is a helper function to get the program ID for the PaymentAnchor program depending on the cluster.
export function getPaymentAnchorProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return PAYMENT_ANCHOR_PROGRAM_ID;
  }
}
