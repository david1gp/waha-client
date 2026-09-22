import * as a from "valibot"
import { buttonTypeSchema } from "./buttonTypeSchema.js"

export const messageButtonSchema = a.object({
  type: buttonTypeSchema,
  text: a.string(),
  id: a.optional(a.string()),
  url: a.optional(a.string()),
  phoneNumber: a.optional(a.string()),
  copyCode: a.optional(a.string()),
})
