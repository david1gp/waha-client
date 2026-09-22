import * as a from "valibot"
import { wahaClientConfigSchema } from "../client/wahaClientConfigSchema.js"

export const sessionsStopOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  name: a.optional(a.pipe(a.string(), a.minLength(1))),
  logout: a.optional(a.boolean()),
})

export type SessionsStopOptions = a.InferInput<typeof sessionsStopOptionsSchema>
