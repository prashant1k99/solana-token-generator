import { ExplorerLink } from "@/components/ExplorerLink";
import { ResponsiveDrawer } from "@/components/ResponsiveDrawer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createBurnTokenFormSchema } from "@/helpers/burnTokenFormSchema";
import { useNetwork } from "@/hooks/network-context";
import { useRefresh } from "@/hooks/refresh-context";
import { useToast } from "@/hooks/use-toast";
import { burnTokens } from "@/lib/burnTokens";
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
  destinationAccount: string;
}

export function BurnToken({ mintAddress, children, decimal, maxAmount, destinationAccount }: BurnTokenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false)

  const { publicKey, signTransaction } = useWallet()

  const { endpoint } = useNetwork()
  const { toast } = useToast()
  const { refresh } = useRefresh()

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
      decimal,
      deleteTokenAccount: values.deleteTokenAccount,
      destinationAccount
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
          <FormField
            control={form.control}
            name="deleteTokenAccount"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2 border border-destructive">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-destructive">
                    Delete Token Account
                  </FormLabel>
                  <FormDescription>
                    <span>Delete Token account, you will be charged to create another token account. <span className="font-bold text-destructive">This operation is irreversible.</span></span>
                  </FormDescription>
                </div>
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
