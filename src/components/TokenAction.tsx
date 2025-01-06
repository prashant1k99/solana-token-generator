import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Eye, Loader2 } from "lucide-react"
import { TokenData } from "./RenderTokens"
import { Separator } from "./ui/separator"
import { Suspense, useEffect, useState } from "react"
import { fetchMetadata, Metadata, PromiseWithStatus, use } from "@/lib/utils"
import { Table, TableBody, TableCell, TableRow } from "./ui/table"
import { MintToken } from "@/pages/MintToken"
import { useWallet } from "@solana/wallet-adapter-react"

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
  console.log(token)

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
        "Total Supply": token.mintInfo.supply.toString(),
        "Update Authority": token.metadata?.updateAuthority?.toString() || "Unknown",
        "Freeze Authority": token.mintInfo.freezeAuthority || "Unknown",
        "Decimals": token.mintInfo.decimals,
        "Amount Owned": token.amount,
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
        <SheetContent className="flex flex-col gap-4 min-w-[600px]" side={"right"}>
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
              <MintToken mintAddress={token.mintPublicKey.toString()}>
                <Button disabled={isMintingDisabled()} className="w-full" type="submit">Mint Tokens</Button>
              </MintToken>
              <SheetClose asChild>
                <Button variant={"secondary"} className="w-full">Close</Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
