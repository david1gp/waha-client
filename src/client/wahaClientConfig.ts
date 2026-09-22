import * as a from "valibot"
import { createResult, createResultError, type Result } from "#result"
import type { WahaClientConfig, WahaClientConfigInput } from "./wahaClientConfigSchema.js"
import { wahaClientConfigSchema } from "./wahaClientConfigSchema.js"

export function wahaClientConfig(input: WahaClientConfigInput): Result<WahaClientConfig> {
  const op = "wahaClientConfig"
  const parsed = a.safeParse(wahaClientConfigSchema, input)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues))
  }
  return createResult(parsed.output)
}
