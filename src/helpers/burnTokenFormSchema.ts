import { z } from "zod";

export const createBurnTokenFormSchema = (maxAmount: number) => z.object({
  amount: z.number({
    required_error: "Amount is required"
  }).max(maxAmount, { message: `Amount cannot exceed ${maxAmount}` }),

  deleteTokenAccount: z.boolean().default(false)
})
