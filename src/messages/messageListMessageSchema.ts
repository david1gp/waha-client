import * as a from "valibot"
import { messageListSectionSchema } from "./messageListSectionSchema.js"

export const messageListMessageSchema = a.object({
  title: a.string(),
  description: a.optional(a.string()),
  footer: a.optional(a.string()),
  button: a.string(),
  sections: a.pipe(a.array(messageListSectionSchema), a.minLength(1)),
})
