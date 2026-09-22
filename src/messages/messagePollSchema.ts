import * as a from "valibot"

export const messagePollSchema = a.object({
  name: a.string(),
  options: a.array(a.string()),
  multipleAnswers: a.optional(a.boolean()),
})
