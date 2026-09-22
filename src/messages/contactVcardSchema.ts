import * as a from "valibot"

export const contactVcardSchema = a.object({
  vcard: a.string(),
})
