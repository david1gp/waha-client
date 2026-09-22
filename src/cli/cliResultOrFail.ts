import type { PromiseResult, Result } from "#result"
import { cliFail } from "./cliFail.js"

export function cliResultOrFail<T>(result: Result<T> | Awaited<PromiseResult<T>>): T {
  if (!result.success) cliFail(result)
  return result.data
}
