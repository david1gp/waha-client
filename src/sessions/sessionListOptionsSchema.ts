import * as a from "valibot"
import { wahaClientConfigSchema } from "../client/wahaClientConfigSchema.js"
import { sessionExpandSchema } from "./sessionExpandSchema.js"

export const sessionListOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  all: a.optional(a.boolean()),
  expand: a.optional(a.array(sessionExpandSchema)),
})

export type SessionListOptions = a.InferInput<typeof sessionListOptionsSchema>
