import { Check, Copy, Eye, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { copyToClipboard } from "@/lib/utils";
import { useState } from "react";
import { Button } from "./ui/button";

interface TokenMetadata {
  name?: string,
  symbol?: string,
  additionalMetadata?: Record<string, unknown>,
  uri?: string,
  updateAuthority?: string,
}

interface MintInfo {
  decimals: number,
  supply: bigint,
  freezeAuthority?: string,
  mintAuthority?: string,
}

export interface TokenData {
  mintPublicKey: string,
  amount: string,
  owner: string,
  mintInfo: MintInfo,
  metadata?: TokenMetadata,
}

export interface RenderTokenListProps {
  data: TokenData[] | null
}

export function RenderTokens({ data }: RenderTokenListProps) {
  const [copied, setCopied] = useState<string>("")

  if (data == null) {
    return (
      <div className="w-full, h-full flex justify-center items-center">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    )
  }

  const copyText = (text: string) => {
    copyToClipboard(text)
    setCopied(text)
    setTimeout(() => setCopied(""), 1000)
  }

  return (
    <Table>
      <TableCaption>All SPL 2022 Program Tokens you Own</TableCaption>
      <TableHeader className="bg-secondary">
        <TableRow>
          <TableHead >Name</TableHead>
          <TableHead>Symbol</TableHead>
          <TableHead>Mint Address</TableHead>
          <TableHead>Owned</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((token) => (
          <TableRow className="hover:bg-primary rounded-xl m-1" key={token.mintPublicKey}>
            <TableCell className="font-medium">{token.metadata?.name || "Unknwon Token"}</TableCell>
            <TableCell>{token.metadata?.symbol || "NA"}</TableCell>
            <TableCell className="flex gap-2 h-full align-middle">
              {copied == token.mintPublicKey ?
                <Check className="w-4 h-4 text-green-600" />
                :
                <Copy className="w-4 h-4 cursor-pointer" onClick={() => copyText(token.mintPublicKey)} />
              }
              {token.mintPublicKey}
            </TableCell>
            <TableCell>{parseFloat(token.amount) / (10 ** token.mintInfo.decimals)}</TableCell>
            <TableCell className="p-2">
              <Button size={"icon"} variant={"secondary"}>
                <Eye className="w-6 h-6" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
