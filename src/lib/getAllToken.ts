import { TokenData } from "@/components/RenderTokens";
import {
  AccountLayout,
  TOKEN_2022_PROGRAM_ID,
  getMint,
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

  return Promise.all([
    getTokenMetadata(
      conn,
      mintAddress,
      "confirmed",
      TOKEN_2022_PROGRAM_ID,
    ),
    getMint(conn, mintAddress, "confirmed", TOKEN_2022_PROGRAM_ID)
  ]);
}

export async function fetchAllTokensAndMetadata({ endpoint, publicKey }: {
  endpoint: string,
  publicKey: PublicKey,
}): Promise<TokenData[]> {
  const allTokens = await fetchAllUserTokens({
    endpoint,
    publicKey
  })

  const tokenMetadataPromise = Promise.all(allTokens
    .map(async (token) => {
      const [metadata, mintInfo] = await fetchTokenMetadata({
        mintAddress: token.data.mint,
        endpoint
      })

      return {
        mintPublicKey: token.data.mint.toString(),
        amount: Number(token.data.amount),
        owner: token.data.owner.toString(),
        metadata: {
          name: metadata?.name,
          symbol: metadata?.symbol,
          additionalMetadata: metadata?.additionalMetadata,
          uri: metadata?.uri,
          updateAuthority: metadata?.updateAuthority,
        },
        mintInfo: {
          decimals: mintInfo.decimals,
          freezeAuthority: mintInfo.freezeAuthority?.toString(),
          mintAuthority: mintInfo.mintAuthority?.toString(),
          supply: mintInfo.supply
        }
      } as TokenData
    }))
  return (await tokenMetadataPromise).filter(token => {
    if (token.amount == 0 && (!token.mintInfo.mintAuthority || token.mintInfo.mintAuthority != publicKey.toString())) return false
    return true
  })
}
