import * as a from "valibot"
import { wahaClientConfigSchema } from "../client/wahaClientConfigSchema.js"
import { sessionConfigSchema } from "./sessionConfigSchema.js"
import { sessionNameSchema } from "./sessionNameSchema.js"

export const sessionCreateOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  name: a.optional(sessionNameSchema),
  sessionConfig: sessionConfigSchema,
  apps: a.optional(a.nullable(a.array(a.unknown()))),
  start: a.optional(a.boolean()),
})

export type SessionCreateOptions = a.InferInput<typeof sessionCreateOptionsSchema>
