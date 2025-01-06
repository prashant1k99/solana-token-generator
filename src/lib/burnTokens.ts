import { createBurnInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token"
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import { Connection, PublicKey, SendTransactionError, Transaction } from "@solana/web3.js"

export async function burnTokens({
  publicKey,
  mintAddress,
  endpoint,
  signTransaction,
  amount,
  decimal,
}: {
  endpoint: string,
  mintAddress: string,
  publicKey: PublicKey,
  signTransaction: SignerWalletAdapterProps['signTransaction'],
  amount: number,
  decimal: number,
}) {
  const conn = new Connection(endpoint, "confirmed");

  const transaction = new Transaction();
  const mint = new PublicKey(mintAddress);

  const tokenAccount = await getAssociatedTokenAddress(mint, publicKey, false, TOKEN_2022_PROGRAM_ID)

  transaction.add(createBurnInstruction(tokenAccount, mint, publicKey, BigInt(amount * (10 ** decimal)), undefined, TOKEN_2022_PROGRAM_ID))

  try {
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

    return {
      signature,
      signedTransaction,
      confirmation
    }
  } catch (error) {
    if (error instanceof SendTransactionError) {
      console.log(await error.getLogs(conn));
      throw new Error("Error while processing transaction: " + error.message);
    } else throw error
  }
}
