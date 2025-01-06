import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

export async function transferToken({
  publicKey,
  toWalletKey,
  amount,
  decimal,
  signTransaction,
  endpoint,
  mint
}: {
  publicKey: PublicKey,
  toWalletKey: string,
  amount: number,
  decimal: number,
  signTransaction: SignerWalletAdapterProps['signTransaction'],
  endpoint: string,
  mint: string
}) {
  const conn = new Connection(endpoint, "confirmed");

  const mintAddress = new PublicKey(mint)
  const toWalletAddress = new PublicKey(toWalletKey)

  const fromTokenAddress = await getAssociatedTokenAddress(mintAddress, publicKey)


  const toAssociatedTokenAddress = await getAssociatedTokenAddress(
    mintAddress, // mint address
    toWalletAddress, // owner
    false, // allow owner off curve
    TOKEN_2022_PROGRAM_ID, // programId
  );

  const transaction = new Transaction()
  try {
    await getAccount(conn, toAssociatedTokenAddress, "confirmed", TOKEN_2022_PROGRAM_ID)
  } catch (e) {
    console.log(e)
    transaction.add(
      createAssociatedTokenAccountInstruction(
        publicKey, // payer
        toAssociatedTokenAddress, // ata
        toWalletAddress, // owner
        mintAddress, // mint
        TOKEN_2022_PROGRAM_ID
      )
    );
  }

  transaction.add(createTransferInstruction(fromTokenAddress, toAssociatedTokenAddress, publicKey, (amount * (10 ** decimal))))

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

  return { signature }
}
