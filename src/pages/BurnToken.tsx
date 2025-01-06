import { ExplorerLink } from "@/components/ExplorerLink";
import { ResponsiveDrawer } from "@/components/ResponsiveDrawer";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createBurnTokenFormSchema } from "@/helpers/burnTokenFormSchema";
import { useNetwork } from "@/hooks/network-context";
import { useToast } from "@/hooks/use-toast";
import { burnTokens } from "@/lib/burnTokens";
import { transferToken } from "@/lib/transferToken";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface BurnTokenProps {
  mintAddress: string;
  decimal: number;
  maxAmount: number;
  children: ReactNode;
}

export function BurnToken({ mintAddress, children, decimal, maxAmount }: BurnTokenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false)

  const { publicKey, signTransaction } = useWallet()

  const { endpoint } = useNetwork();
  const { toast } = useToast()

  const burnTokenFormSchema = createBurnTokenFormSchema(maxAmount)
  const form = useForm<z.infer<typeof burnTokenFormSchema>>({
    resolver: zodResolver(burnTokenFormSchema),
  })

  function onSubmit(values: z.infer<typeof burnTokenFormSchema>) {
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

    burnTokens({
      publicKey,
      signTransaction,
      amount: values.amount,
      endpoint,
      mintAddress,
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
      setIsOpen(false)
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
    <ResponsiveDrawer open={isOpen} onOpenChange={(val) => setIsOpen(val)} smallSize trigger={children} title="Mint Tokens" description="Once burned you cannot reclaim tokens.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={`Max: ${maxAmount}`}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Amount to burn
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button variant={"destructive"} disabled={isProcessing} className="w-full" type="submit">
            {isProcessing && (
              <Loader2 className="h-6 w-6 animate-spin" />
            )}
            Burn Tokens
          </Button>
        </form>
      </Form>
    </ResponsiveDrawer>
  )
}
