import { ExplorerLink } from "@/components/ExplorerLink";
import { ResponsiveDrawer } from "@/components/ResponsiveDrawer";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createTransferTokenFormSchema } from "@/helpers/transferTokens";
import { useNetwork } from "@/hooks/network-context";
import { useRefresh } from "@/hooks/refresh-context";
import { useToast } from "@/hooks/use-toast";
import { transferToken } from "@/lib/transferToken";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface TransferTokenProps {
  mintAddress: string;
  decimal: number;
  maxAmount: number;
  children: ReactNode;
}

export function TransferToken({ mintAddress, children, decimal, maxAmount }: TransferTokenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false)

  const { publicKey, signTransaction } = useWallet()

  const { endpoint } = useNetwork()
  const { toast } = useToast()
  const { refresh } = useRefresh()

  const transferTokenFormSchema = createTransferTokenFormSchema(maxAmount)
  const form = useForm<z.infer<typeof transferTokenFormSchema>>({
    resolver: zodResolver(transferTokenFormSchema),
  })

  function onSubmit(values: z.infer<typeof transferTokenFormSchema>) {
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

    transferToken({
      publicKey,
      signTransaction,
      toWalletKey: values.toWallet,
      amount: values.amount,
      endpoint,
      mint: mintAddress,
      decimal
    }).then((data) => {
      toast({
        title: "Token transfer successfully",
        description: (
          <div>
            <ExplorerLink path={`tx/${data.signature}`} label={'View Transaction'} className="btn btn-xs btn-primary" />
          </div>
        )
      })
      setIsOpen((false))
      refresh()
    }).catch((e) => {
      let description = "Something went wrong, try again later.";
      if (e instanceof Error) {
        description = e.message
      }
      toast({
        title: "Unable to transfer token.",
        description,
        variant: "destructive"
      })
    }
    ).finally(() => setIsProcessing(false))
  }

  return (
    <ResponsiveDrawer open={isOpen} onOpenChange={(val) => setIsOpen(val)} smallSize trigger={children} title="Mint Tokens">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="toWallet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To Wallet</FormLabel>
                <FormControl>
                  <Input placeholder="Wallet Address" {...field} />
                </FormControl>
                <FormDescription>
                  Wallet Address in which the tokens will be minted to.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1000000"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Amount to transfer
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isProcessing} className="w-full" type="submit">
            {isProcessing && (
              <Loader2 className="h-6 w-6 animate-spin" />
            )}
            Submit
          </Button>
        </form>
      </Form>
    </ResponsiveDrawer>
  )
}
