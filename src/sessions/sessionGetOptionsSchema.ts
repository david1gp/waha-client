import * as a from "valibot"
import { wahaClientConfigSchema } from "../client/wahaClientConfigSchema.js"
import { sessionExpandSchema } from "./sessionExpandSchema.js"

export const sessionGetOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  session: a.optional(a.pipe(a.string(), a.minLength(1))),
  expand: a.optional(a.array(sessionExpandSchema)),
})

export type SessionGetOptions = a.InferInput<typeof sessionGetOptionsSchema>
