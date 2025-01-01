import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export async function aidropSOLInWallet({ endpoint, publicKey, amount = 1 }: { endpoint: string, publicKey: PublicKey, amount: number }) {
  const conn = new Connection(endpoint, "confirmed");

  const signature = await conn.requestAirdrop(
    publicKey,
    amount * LAMPORTS_PER_SOL,
  );
  await conn.confirmTransaction(signature, "confirmed");
  return signature
}
