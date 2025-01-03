import { ResponsiveDrawer } from "@/components/ResponsiveDrawer";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea";
import { formSchema } from "@/helpers/createTokenZod";
import { useWallet } from "@solana/wallet-adapter-react";
import { createToken } from "@/lib/createToken";
import { useToast } from "@/hooks/use-toast";
import { useNetwork } from "@/hooks/network-context";
import { ExplorerLink } from "@/components/ExplorerLink";

export function CreateToken() {
  const [isProcessing, setIsProcessing] = useState(false);

  const { publicKey, signTransaction } = useWallet()
  const { endpoint } = useNetwork();
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      symbol: "",
      decimals: 9,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
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

    createToken({
      formData: values,
      publicKey,
      signTransaction,
      endpoint
    }).then((data) => {
      toast({
        title: "Token created successfully",
        description: (
          <div>
            <ExplorerLink path={`tx/${data.signature}`} label={'View Transaction'} className="btn btn-xs btn-primary" /> |
            <ExplorerLink path={`tx/${data.mintPublicKey}`} label={'View Token'} className="btn btn-xs btn-primary" />
          </div>
        )
      })
    }).catch((e) => {
      let description = "Something went wrong, try again later.";
      if (e instanceof Error) {
        description = e.message
      }
      toast({
        title: "Unable to create token.",
        description,
        variant: "destructive"
      })
    }).finally(() => setIsProcessing(false))
  }

  return (
    <ResponsiveDrawer title="Create Token" trigger={
      <Button>
        Create Token
      </Button>
    }
      isProcessing={isProcessing}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token Name</FormLabel>
                <FormControl>
                  <Input placeholder="My SGT Token" {...field} />
                </FormControl>
                <FormDescription>
                  This will be displayed on Token.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="symbol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token Symbol</FormLabel>
                <FormControl>
                  <Input placeholder="MSGTT" {...field} />
                </FormControl>
                <FormDescription>
                  This will be the Token Symbol.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="decimals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Decimals</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={9}
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Number of decimal places for your token (0-9)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token Image</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        field.onChange(file);
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Upload an image for your token
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="This is token description. (Optional)"
                    maxLength={400}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button disabled={isProcessing} className="w-full" type="submit">Submit</Button>
        </form>
      </Form>
    </ex>
  )
}
