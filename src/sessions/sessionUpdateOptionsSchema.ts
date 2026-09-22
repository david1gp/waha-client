import * as a from "valibot"
import { wahaClientConfigSchema } from "../client/wahaClientConfigSchema.js"
import { sessionConfigSchema } from "./sessionConfigSchema.js"

export const sessionUpdateOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  session: a.optional(a.pipe(a.string(), a.minLength(1))),
  sessionConfig: sessionConfigSchema,
  apps: a.optional(a.nullable(a.array(a.unknown()))),
})

export type SessionUpdateOptions = a.InferInput<typeof sessionUpdateOptionsSchema>
