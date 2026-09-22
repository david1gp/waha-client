import * as a from "valibot"
import { wahaClientConfigSchema } from "../client/wahaClientConfigSchema.js"

export const sessionsLogoutOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  name: a.optional(a.pipe(a.string(), a.minLength(1))),
})

export type SessionsLogoutOptions = a.InferInput<typeof sessionsLogoutOptionsSchema>
