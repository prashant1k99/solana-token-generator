import { createAssociatedTokenAccountInstruction, createMintToInstruction, getAccount, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token"
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import { Connection, PublicKey, Transaction } from "@solana/web3.js"

export async function mintToken({
  endpoint,
  publicKey,
  amount,
  toWallet,
  mint,
  signTransaction,
  decimal,
}: {
  publicKey: PublicKey,
  endpoint: string,
  amount: number,
  toWallet: string,
  mint: string,
  signTransaction: SignerWalletAdapterProps['signTransaction'],
  decimal: number
}) {
  const conn = new Connection(endpoint, "confirmed")

  const mintAddress = new PublicKey(mint)
  const toWalletAddress = new PublicKey(toWallet)

  const associatedTokenAccount = await getAssociatedTokenAddress(
    mintAddress, // mint address
    toWalletAddress, // owner
    false, // allow owner off curve
    TOKEN_2022_PROGRAM_ID, // programId
  );

  const transaction = new Transaction();

  try {
    await getAccount(conn, associatedTokenAccount, "confirmed", TOKEN_2022_PROGRAM_ID)
  } catch (e) {
    console.log(e)
    transaction.add(
      createAssociatedTokenAccountInstruction(
        publicKey, // payer
        associatedTokenAccount, // ata
        toWalletAddress, // owner
        mintAddress, // mint
        TOKEN_2022_PROGRAM_ID
      )
    );

  }

  transaction.add(
    createMintToInstruction(
      mintAddress,
      associatedTokenAccount,
      publicKey,
      amount * (10 ** decimal),
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

  return { account: associatedTokenAccount.toString(), signature }
}
