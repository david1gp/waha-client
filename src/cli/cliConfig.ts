import type { Result } from "#result"
import type { WahaClientConfig } from "../wahaClientConfig.js"
import { wahaClientFromEnv } from "../wahaClientFromEnv.js"

export type CliConfigFlags = {
  baseUrl?: string
  apiKey?: string
  session?: string
}

/** Shared optional flags that override env. */
export const cliConfigFlagParams = {
  baseUrl: {
    kind: "parsed" as const,
    parse: String,
    optional: true as const,
    brief: "Override WAHA_BASE_URL",
  },
  apiKey: {
    kind: "parsed" as const,
    parse: String,
    optional: true as const,
    brief: "Override WAHA_API_KEY",
  },
  session: {
    kind: "parsed" as const,
    parse: String,
    optional: true as const,
    brief: "Override WAHA_SESSION",
  },
}

/** Load config from env with optional flag overrides. */
export function cliConfigLoad(flags: CliConfigFlags = {}): Result<WahaClientConfig> {
  const env: Record<string, string | undefined> = { ...process.env }
  if (flags.baseUrl !== undefined) env.WAHA_BASE_URL = flags.baseUrl
  if (flags.apiKey !== undefined) env.WAHA_API_KEY = flags.apiKey
  if (flags.session !== undefined) env.WAHA_SESSION = flags.session
  return wahaClientFromEnv(env)
}
