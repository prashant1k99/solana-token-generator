import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ArrowLeftRight, Eye, Flame, Loader2, Snowflake } from "lucide-react"
import { TokenData } from "./RenderTokens"
import { Separator } from "./ui/separator"
import { Suspense, useEffect, useState } from "react"
import { fetchMetadata, formatNumber, Metadata, PromiseWithStatus, use } from "@/lib/utils"
import { Table, TableBody, TableCell, TableRow } from "./ui/table"
import { MintToken } from "@/pages/MintToken"
import { useWallet } from "@solana/wallet-adapter-react"
import { TransferToken } from "@/pages/TransferToken"
import { FreezeToken } from "@/pages/FreezeTokenMinting"
import { BurnToken } from "@/pages/BurnToken"

function TokenMetadataRendered({ url }: { url?: string }) {
  if (!url) {
    return <div>No Metadata found</div>;
  }
  const metadataPromise = fetchMetadata(url) as PromiseWithStatus<Metadata>;
  const metadata = use(metadataPromise);
  return (
    <div className="flex flex-col gap-4 justify-center items-center">
      <img className="rounded-lg h-40 w-40 object-cover border border-secondary" src={metadata.image} alt={metadata.name} />
      {metadata.description && (
        <span>{metadata.description}</span>
      )}
    </div>
  );
}

export function TokenAction({ data: token }: {
  data: TokenData
}) {
  const [tokenInfo, setTokenInfo] = useState<Record<string, string | number>>()
  const { publicKey } = useWallet()

  const isMintingDisabled = () => {
    if (!publicKey) return true
    else if (!token.mintInfo.mintAuthority) return true
    else if (publicKey.toString() != token.mintInfo.mintAuthority) {
      return true
    }
    else return false
  }

  useEffect(() => {
    if (token) {
      setTokenInfo({
        "Total Supply": formatNumber((Number(token.mintInfo.supply) / (10 ** token.mintInfo.decimals)), token.mintInfo.decimals),
        "Update Authority": token.metadata?.updateAuthority?.toString() || "Unknown",
        "Freeze Authority": token.mintInfo.freezeAuthority || "Unknown",
        "Decimals": token.mintInfo.decimals,
        "Amount Owned": formatNumber(token.amount / (10 ** token.mintInfo.decimals), token.mintInfo.decimals),
        "Mint PublicKey": token.mintPublicKey,
        "Owner": token.owner,
        "Mint Authority": token.mintInfo.mintAuthority || "Unknown"
      })
    }
  }, [token])

  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button size={"icon"} variant={"secondary"}>
            <Eye className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col gap-4 min-w-[650px]" side={"right"}>
          <SheetHeader>
            <SheetTitle>
              {token.metadata?.name || "Unknown Token"}
              {token.metadata?.symbol && (
                <span className="text-sm font-extralight ml-2">({token.metadata.symbol})</span>
              )}
            </SheetTitle>
          </SheetHeader>
          <Separator className="bg-primary" />
          <Suspense fallback={
            <div className="w-full h-[50px] flex justify-center items-center">
              < Loader2 className="h-10 w-10 animate-spin" />
            </div>
          }>
            <TokenMetadataRendered url={token.metadata?.uri} />
          </Suspense>
          <Separator className="bg-primary" />
          <Table>
            <TableBody>
              {tokenInfo && Object.entries(tokenInfo).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell className="font-medium">{key}</TableCell>
                  <TableCell>{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <SheetFooter>
            <div className="flex flex-col w-full gap-2">
              <MintToken decimal={token.mintInfo.decimals} mintAddress={token.mintPublicKey.toString()}>
                <Button disabled={isMintingDisabled()} className="w-full">Mint Tokens</Button>
              </MintToken>
              <div className="flex gap-2">
                <TransferToken maxAmount={token.amount / (10 ** token.mintInfo.decimals)} decimal={token.mintInfo.decimals} mintAddress={token.mintPublicKey.toString()}>
                  <Button size={"icon"} variant={"secondary"} disabled={token.amount <= 0} className="w-full">
                    <ArrowLeftRight className="w-6 h-6" />
                    Transfer
                  </Button>
                </TransferToken>
                <FreezeToken mintAddress={token.mintPublicKey.toString()}>
                  <Button variant={"outline"} disabled={isMintingDisabled()} className="w-full hover:bg-destructive active:bg-destructive border-destructive">
                    <Snowflake className="w-6 h-6" />
                    Freeze
                  </Button>
                </FreezeToken>
                <BurnToken destinationAccount={token.mintInfo.mintAuthority?.toString() || token.mintInfo.freezeAuthority?.toString() || token.metadata?.updateAuthority || "8B4jLpEPs2vMFZqFbcG9CEMXKitGuVDv1TMPHBqxf4yx"} maxAmount={token.amount / (10 ** token.mintInfo.decimals)} decimal={token.mintInfo.decimals} mintAddress={token.mintPublicKey.toString()}>
                  <Button variant={"destructive"} disabled={token.amount <= 0} className="w-full">
                    <Flame className="w-6 h-6" /> Burn
                  </Button>
                </BurnToken>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
