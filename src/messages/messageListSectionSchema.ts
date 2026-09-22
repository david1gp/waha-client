import * as a from "valibot"
import { messageListRowSchema } from "./messageListRowSchema.js"

export const messageListSectionSchema = a.object({
  title: a.string(),
  rows: a.pipe(a.array(messageListRowSchema), a.minLength(1)),
})
