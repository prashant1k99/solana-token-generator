import { PublicKey } from "@solana/web3.js"
import { z } from "zod"

export const createTransferTokenFormSchema = (maxAmount: number) => z.object({
  toWallet: z.string()
    .min(32, "Invalid wallet address")
    .max(44, "Invalid wallet address")
    .superRefine((address, ctx) => {
      try {
        new PublicKey(address)
        return true
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid Wallet address"
        })
      }
    }),

  amount: z.number({
    required_error: "Amount is required"
  }).min(1).max(maxAmount, { message: `Amount cannot exceed ${maxAmount}` }),
})
