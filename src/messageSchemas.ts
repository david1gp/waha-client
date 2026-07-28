import * as a from "valibot"
import type { WahaClientConfig } from "./wahaClientConfig.js"

export const configSchema = a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null)

export const wahaFileSchema = a.union([
  a.object({
    mimetype: a.string(),
    filename: a.optional(a.string()),
    url: a.string(),
  }),
  a.object({
    mimetype: a.string(),
    filename: a.optional(a.string()),
    data: a.string(),
  }),
])

export const sessionOptionalSchema = a.optional(a.string())

export const chatIdSchema = a.pipe(a.string(), a.minLength(1))

export const buttonTypeSchema = a.picklist(["reply", "url", "call", "copy"])

export const messageButtonSchema = a.object({
  type: buttonTypeSchema,
  text: a.string(),
  id: a.optional(a.string()),
  url: a.optional(a.string()),
  phoneNumber: a.optional(a.string()),
  copyCode: a.optional(a.string()),
})

export const messagePollSchema = a.object({
  name: a.string(),
  options: a.array(a.string()),
  multipleAnswers: a.optional(a.boolean()),
})

export const messageListRowSchema = a.object({
  title: a.string(),
  description: a.optional(a.string()),
  rowId: a.string(),
})

export const messageListSectionSchema = a.object({
  title: a.string(),
  rows: a.pipe(a.array(messageListRowSchema), a.minLength(1)),
})

export const messageListMessageSchema = a.object({
  title: a.string(),
  description: a.optional(a.string()),
  footer: a.optional(a.string()),
  button: a.string(),
  sections: a.pipe(a.array(messageListSectionSchema), a.minLength(1)),
})

export const linkPreviewDataSchema = a.object({
  url: a.string(),
  title: a.string(),
  description: a.string(),
  image: a.optional(wahaFileSchema),
})

export const contactVcardSchema = a.object({
  vcard: a.string(),
})

export const contactStructuredSchema = a.object({
  fullName: a.string(),
  organization: a.optional(a.string()),
  phoneNumber: a.string(),
  whatsappId: a.optional(a.string()),
  vcard: a.optional(a.nullable(a.string())),
})

export const messageContactSchema = a.union([contactVcardSchema, contactStructuredSchema])

/** Drop keys whose value is `undefined` so JSON omits them. */
export function bodyOmitUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v
  }
  return out
}
