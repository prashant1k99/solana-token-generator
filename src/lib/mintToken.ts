import { createMintToInstruction, getAccount, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token"
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import { Connection, PublicKey, Transaction } from "@solana/web3.js"

export async function mintToken({
  endpoint,
  publicKey,
  amount,
  // toWallet,
  mintAddress,
  signTransaction
}: {
  publicKey: PublicKey,
  endpoint: string,
  amount: number,
  // toWallet: PublicKey,
  mintAddress: PublicKey,
  signTransaction: SignerWalletAdapterProps['signTransaction'],
}) {
  const conn = new Connection(endpoint, "confirmed")

  const associatedTokenAccount = await getAssociatedTokenAddress(
    mintAddress, // mint address
    publicKey, // owner
    false, // allow owner off curve
    TOKEN_2022_PROGRAM_ID, // programId
  );

  const account = await getAccount(conn, associatedTokenAccount, "confirmed", TOKEN_2022_PROGRAM_ID)

  const transaction = new Transaction();

  transaction.add(
    createMintToInstruction(
      mintAddress,
      associatedTokenAccount,
      publicKey,
      amount,
      undefined,
      TOKEN_2022_PROGRAM_ID
    )
  )

  const { blockhash } = await conn.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = publicKey;

  const signedTransaction = await signTransaction(transaction);
  if (!signedTransaction) {
    throw new Error("Transaction not completed");
  }

  const signature = await conn.sendRawTransaction(
    signedTransaction.serialize(),
  );

  const confirmation = await conn.confirmTransaction({
    signature,
    blockhash: transaction.recentBlockhash!,
    lastValidBlockHeight:
      ((await conn.getLatestBlockhash()).lastValidBlockHeight),
  }, "confirmed");

  if (confirmation.value.err) {
    throw new Error(`Transaction failed: ${confirmation.value.err}`);
  }

  return { account: associatedTokenAccount.toString(), info: account, signature }
}
