import { z } from "zod"

export const formSchema = z.object({
  name: z.string().min(2, {
    message: "Token name should be atleast 2 characters."
  }).max(40, {
    message: "Token name should not contain more than 40 characters."
  }),

  symbol: z.string({
    required_error: "Token Symbol is required"
  }).min(1, {
    message: "Token Symbol is required"
  }).max(10, {
    message: "Token symbol can be maximum 10 characters long."
  }).regex(/^[A-Z]{1,10}$/, {
    message: "Invalid Token symbol"
  }),

  decimals: z.number({
    required_error: "Decimals is required"
  }).min(0).max(9),

  image: z.instanceof(File, {
    message: "Token image is requried"
  }),

  description: z.string().max(400).optional(),
})


