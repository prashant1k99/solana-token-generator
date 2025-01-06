import { ExplorerLink } from "@/components/ExplorerLink";
import { ResponsiveDrawer } from "@/components/ResponsiveDrawer";
import { Button } from "@/components/ui/button";
import { useNetwork } from "@/hooks/network-context";
import { useRefresh } from "@/hooks/refresh-context";
import { useToast } from "@/hooks/use-toast";
import { freezeTokenMinting } from "@/lib/freezeTokenMinting";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2 } from "lucide-react";
import { ReactNode, useState } from "react";

interface FreezeTokenProps {
  mintAddress: string,
  children: ReactNode
}

export function FreezeToken({
  mintAddress,
  children
}: FreezeTokenProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const { publicKey, signTransaction } = useWallet()
  const { endpoint } = useNetwork()
  const { toast } = useToast()
  const { refresh } = useRefresh()

  const freezeMint = () => {
    setIsProcessing(true)

    if (!publicKey) {
      setIsProcessing(false)
      // Show error toast
      toast({
        title: "Unable to fetch PublicKey.",
        description: "Please verify that your wallet is connected properly and try again.",
        variant: "destructive"
      })
      return
    }
    if (!signTransaction) {
      setIsProcessing(false)
      // Show error toast
      toast({
        title: "Unable to process request",
        description: "Unable to sign transaction, please refresh and try again.",
        variant: "destructive"
      })
      return
    }

    freezeTokenMinting({
      mintAddress,
      publicKey,
      endpoint,
      signTransaction
    }).then((data) => {
      toast({
        title: "Mint Freezed successfully",
        description: (
          <div>
            <ExplorerLink path={`tx/${data.signature}`} label={'View Transaction'} className="btn btn-xs btn-primary" />
          </div>
        )
      })
      refresh()
    }).catch((e) => {
      let description = "Something went wrong, try again later.";
      if (e instanceof Error) {
        description = e.message
      }
      toast({
        title: "Unable to freezed mint.",
        description,
        variant: "destructive"
      })
    }
    ).finally(() => setIsProcessing(false))
  }

  return (
    <ResponsiveDrawer open={isOpen} onOpenChange={(val) => setIsOpen(val)} title="Freeze Token" description="After Freezing, no more token can be minted." smallSize trigger={children} >
      <span className="font-bold text-lg text-destructive ">This action is Irreversible. Do you wish to proceed?</span>
      <div className="mt-4 flex gap-2">
        <Button onClick={freezeMint} disabled={isProcessing} className="w-full" variant={"destructive"}>
          {isProcessing && (
            <Loader2 className="h-6 w-6 animate-spin" />
          )}
          Confirm
        </Button>
        <Button onClick={() => setIsOpen(false)} disabled={isProcessing} className="w-full" variant={"secondary"}>Cancel</Button>
      </div>
    </ResponsiveDrawer >
  )
}
