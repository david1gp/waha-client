import * as a from "valibot"

export const messageListRowSchema = a.object({
  title: a.string(),
  description: a.optional(a.string()),
  rowId: a.string(),
})
