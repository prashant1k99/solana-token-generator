import { ExplorerLink } from "@/components/ExplorerLink";
import { ResponsiveDrawer } from "@/components/ResponsiveDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastAction } from "@/components/ui/toast";
import { useNetwork } from "@/hooks/network-context";
import { useToast } from "@/hooks/use-toast";
import { aidropSOLInWallet } from "@/lib/airdrop";
import { useWallet } from "@solana/wallet-adapter-react";
import { SendTransactionError } from "@solana/web3.js";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

export function AirdropTokens() {
  const [solAmount, setSolAmount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const { endpoint } = useNetwork();
  const { publicKey } = useWallet();
  const { toast } = useToast()

  const handleAirdropAmount = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault()
    if (!publicKey) return

    setIsProcessing(true)
    aidropSOLInWallet({
      amount: solAmount,
      endpoint,
      publicKey,
    }).then((signature) => {
      console.log(signature)
      toast({
        title: "Transaction sent",
        description: (
          <ExplorerLink path={`tx/${signature}`} label={'View Transaction'} className="btn btn-xs btn-primary" />
        )
      })
    }).catch((err) => {
      let errorDescription;
      if (err instanceof SendTransactionError) {
        errorDescription = err.name;
      } else if (err instanceof Error) {
        if (err.message.includes("429")) {
          errorDescription = "You've either reached your airdrop limit today or the airdrop faucet has run dry."
        }
      }

      toast({
        title: "Failed to Airdrop",
        description: errorDescription,
        action: <ToastAction onClick={() => handleAirdropAmount()} altText="Try again">Try again</ToastAction>,
        variant: "destructive",
      })
      console.error(err)
    }).finally(() => setIsProcessing(false))
  }

  return (
    <ResponsiveDrawer
      title="Airdrop SOL"
      isProcessing={isProcessing}
      trigger={
        <Button variant={"secondary"}>Aidrop Tokens</Button>
      }
    >
      <form onSubmit={handleAirdropAmount}>
        <Input
          value={solAmount}
          max={5}
          type="number"
          onChange={(e) => setSolAmount(e.target.valueAsNumber)}
        />
        <Button disabled={isProcessing} className="w-full mt-4">
          {isProcessing && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Airdrop
        </Button>
      </form>
    </ResponsiveDrawer >
  )
}
