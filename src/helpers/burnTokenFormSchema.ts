import { z } from "zod";

export const createBurnTokenFormSchema = (maxAmount: number) => z.object({
  amount: z.number({
    required_error: "Amount is required"
  }).min(1).max(maxAmount, { message: `Amount cannot exceed ${maxAmount}` }),
})

