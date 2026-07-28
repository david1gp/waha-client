import * as a from "valibot"
import { createResult, createResultError, type Result } from "#result"

export const wahaClientConfigSchema = a.object({
  baseUrl: a.pipe(
    a.string(),
    a.minLength(1),
    a.url(),
    a.transform((s) => s.replace(/\/+$/, "")),
  ),
  apiKey: a.optional(a.string()),
  session: a.optional(a.string()),
  timeoutMs: a.optional(a.pipe(a.number(), a.integer(), a.minValue(1))),
  retries: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
})

export type WahaClientConfigInput = a.InferInput<typeof wahaClientConfigSchema>
export type WahaClientConfig = a.InferOutput<typeof wahaClientConfigSchema>

export function wahaClientConfig(input: WahaClientConfigInput): Result<WahaClientConfig> {
  const op = "wahaClientConfig"
  const parsed = a.safeParse(wahaClientConfigSchema, input)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues), JSON.stringify(input))
  }
  return createResult(parsed.output)
}
