import {
  getPaymentAnchorProgram,
  getPaymentAnchorProgramId,
} from '@payment-anchor/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

export function usePaymentAnchorProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getPaymentAnchorProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getPaymentAnchorProgram(provider);

  const accounts = useQuery({
    queryKey: ['payment-anchor', 'all', { cluster }],
    queryFn: () => program.account.paymentAnchor.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['payment-anchor', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods
        .initialize()
        .accounts({ paymentAnchor: keypair.publicKey })
        .signers([keypair])
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to initialize account'),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  };
}

export function usePaymentAnchorProgramAccount({
  account,
}: {
  account: PublicKey;
}) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = usePaymentAnchorProgram();

  const accountQuery = useQuery({
    queryKey: ['payment-anchor', 'fetch', { cluster, account }],
    queryFn: () => program.account.paymentAnchor.fetch(account),
  });

  const closeMutation = useMutation({
    mutationKey: ['payment-anchor', 'close', { cluster, account }],
    mutationFn: () =>
      program.methods.close().accounts({ paymentAnchor: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const decrementMutation = useMutation({
    mutationKey: ['payment-anchor', 'decrement', { cluster, account }],
    mutationFn: () =>
      program.methods.decrement().accounts({ paymentAnchor: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const incrementMutation = useMutation({
    mutationKey: ['payment-anchor', 'increment', { cluster, account }],
    mutationFn: () =>
      program.methods.increment().accounts({ paymentAnchor: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const setMutation = useMutation({
    mutationKey: ['payment-anchor', 'set', { cluster, account }],
    mutationFn: (value: number) =>
      program.methods.set(value).accounts({ paymentAnchor: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  };
}
