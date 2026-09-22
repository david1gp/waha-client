import * as a from "valibot"
import { wahaClientConfigSchema } from "../client/wahaClientConfigSchema.js"

export const sessionPathOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  session: a.optional(a.pipe(a.string(), a.minLength(1))),
})

export type SessionPathOptions = a.InferInput<typeof sessionPathOptionsSchema>
