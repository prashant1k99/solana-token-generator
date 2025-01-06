import { AuthorityType, createSetAuthorityInstruction, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token"
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import { Connection, PublicKey, Transaction } from "@solana/web3.js"

export async function freezeTokenMinting({
  publicKey,
  mintAddress,
  endpoint,
  signTransaction,
}: {
  endpoint: string,
  mintAddress: string,
  publicKey: PublicKey,
  signTransaction: SignerWalletAdapterProps['signTransaction'],
}) {
  const conn = new Connection(endpoint, "confirmed");

  const transaction = new Transaction();
  const mint = new PublicKey(mintAddress);

  transaction.add(
    createSetAuthorityInstruction(
      mint,
      publicKey,
      AuthorityType.MintTokens,
      null,
      [],
      TOKEN_2022_PROGRAM_ID,
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

  return {
    signature,
    signedTransaction,
    confirmation
  }
}
