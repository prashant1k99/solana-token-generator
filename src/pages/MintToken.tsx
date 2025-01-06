import { ExplorerLink } from "@/components/ExplorerLink";
import { ResponsiveDrawer } from "@/components/ResponsiveDrawer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { mintTokenFormSchema } from "@/helpers/mintTokenZod";
import { useNetwork } from "@/hooks/network-context";
import { useRefresh } from "@/hooks/refresh-context";
import { useToast } from "@/hooks/use-toast";
import { mintToken } from "@/lib/mintToken";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2 } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface MintTokenProps {
  mintAddress: string;
  decimal: number;
  children: ReactNode;
}

export function MintToken({ mintAddress, children, decimal }: MintTokenProps) {
  console.log("Minting: ", mintAddress)
  const [isProcessing, setIsProcessing] = useState(false);

  const { publicKey, signTransaction } = useWallet()

  const { endpoint } = useNetwork()
  const { toast } = useToast()
  const { refresh } = useRefresh()

  const form = useForm<z.infer<typeof mintTokenFormSchema>>({
    resolver: zodResolver(mintTokenFormSchema),
    defaultValues: {
      toWallet: publicKey?.toString() || "",
      freezeSupply: false,
      self: true,
    },
  })

  function onSubmit(values: z.infer<typeof mintTokenFormSchema>) {
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

    mintToken({
      publicKey,
      signTransaction,
      toWallet: values.toWallet,
      amount: values.amount,
      endpoint,
      mint: mintAddress,
      decimal
    }).then((data) => {
      toast({
        title: "Token minted successfully",
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
        title: "Unable to mint token.",
        description,
        variant: "destructive"
      })
    }
    ).finally(() => setIsProcessing(false))
  }

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'toWallet' && publicKey) {
        // If toWallet changes and it's not equal to publicKey, uncheck self
        const isSelfAddress = value.toWallet === publicKey.toString();
        form.setValue('self', isSelfAddress);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, publicKey])

  return (
    <ResponsiveDrawer smallSize trigger={children} title="Mint Tokens">
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
            name="self"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md ">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(e) => {
                      if (e && publicKey) {
                        // When self is checked, set toWallet to publicKey
                        form.setValue('toWallet', publicKey.toString());
                      }
                      field.onChange(e)
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Mint to Self Account</FormLabel>
                </div>
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
                  Amount to mint
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="freezeSupply"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2 border border-destructive">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!form.watch("amount")}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-destructive">
                    Freeze Supply
                  </FormLabel>
                  <FormDescription>
                    {!form.watch("amount") ? (
                      <span className="text-muted-foreground">Set some amount so it can mint and freeze minting.</span>
                    ) : (
                      <span>Disable future minting. <span className="font-bold text-destructive">This operation is irreversible.</span></span>
                    )}
                  </FormDescription>
                </div>
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
