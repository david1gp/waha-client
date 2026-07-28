import { createResult, createResultError, type Result } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"

/** Resolve session from options: `session ?? config.session`. */
export function wahaResolveSession(op: string, config: WahaClientConfig, session: string | undefined): Result<string> {
  const resolved = session ?? config.session
  if (resolved == null || resolved === "") {
    return createResultError(op, "session is required (pass session or set config.session)")
  }
  return createResult(resolved)
}
