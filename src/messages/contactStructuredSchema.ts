import * as a from "valibot"

export const contactStructuredSchema = a.object({
  fullName: a.string(),
  organization: a.optional(a.string()),
  phoneNumber: a.string(),
  whatsappId: a.optional(a.string()),
  vcard: a.optional(a.nullable(a.string())),
})
