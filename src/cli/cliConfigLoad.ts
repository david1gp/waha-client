import type { Result } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaClientFromEnv } from "../client/wahaClientFromEnv.js"
import type { CliConfigFlags } from "./cliConfigFlags.js"

/** Load config from env with optional flag overrides. */
export function cliConfigLoad(flags: CliConfigFlags = {}): Result<WahaClientConfig> {
  const env: Record<string, string | undefined> = { ...process.env }
  if (flags.baseUrl !== undefined) env.WAHA_BASE_URL = flags.baseUrl
  if (flags.apiKey !== undefined) env.WAHA_API_KEY = flags.apiKey
  if (flags.session !== undefined) env.WAHA_SESSION = flags.session
  return wahaClientFromEnv(env)
}
