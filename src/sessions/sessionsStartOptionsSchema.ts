import * as a from "valibot"
import { wahaClientConfigSchema } from "../client/wahaClientConfigSchema.js"
import { sessionConfigSchema } from "./sessionConfigSchema.js"

export const sessionsStartOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  name: a.optional(a.pipe(a.string(), a.minLength(1))),
  sessionConfig: sessionConfigSchema,
})

export type SessionsStartOptions = a.InferInput<typeof sessionsStartOptionsSchema>
