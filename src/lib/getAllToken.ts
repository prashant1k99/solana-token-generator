import {
  AccountLayout,
  TOKEN_2022_PROGRAM_ID,
  getTokenMetadata,
} from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

export async function fetchAllUserTokens({
  endpoint,
  publicKey
}: {
  endpoint: string,
  publicKey: PublicKey
}) {
  const conn = new Connection(endpoint, "confirmed");

  const tokenAccounts = await conn.getTokenAccountsByOwner(
    publicKey,
    {
      programId: TOKEN_2022_PROGRAM_ID,
    },
  );

  return tokenAccounts.value.map((tokenAccount) => {
    return {
      publicKey: tokenAccount.pubkey,
      publicKeyString: tokenAccount.pubkey.toString(),
      ownerString: tokenAccount.account.owner.toString(),
      ...tokenAccount.account,
      data: AccountLayout.decode(tokenAccount.account.data),
    };
  });
}

export async function fetchTokenMetadata(
  { mintAddress, endpoint }: { mintAddress: PublicKey; endpoint: string },
) {
  console.log(mintAddress.toString());
  const conn = new Connection(endpoint, "confirmed");

  return getTokenMetadata(
    conn,
    mintAddress,
    "confirmed",
    TOKEN_2022_PROGRAM_ID,
  );
}

export async function fetchAllTokensAndMetadata({ endpoint, publicKey }: {
  endpoint: string,
  publicKey: PublicKey
}) {
  const allTokens = await fetchAllUserTokens({
    endpoint,
    publicKey
  })
  console.log(allTokens)
  // Loop on all promises

  const tokenMetadataPromise = Promise.all(allTokens.map(async (token) => {
    const metadata = await fetchTokenMetadata({
      mintAddress: token.data.mint,
      endpoint
    })
    console.log("Metadata: ", metadata)
    return {
      token,
      metadata
    }
  }))
  return tokenMetadataPromise
}
