import { createResultError, type Result } from "#result"
import { type WahaClientConfig, wahaClientConfig } from "./wahaClientConfig.js"

/**
 * Load WAHA client config from process.env (Bun auto-loads `.env` into process.env).
 *
 * - `WAHA_BASE_URL` (required)
 * - `WAHA_API_KEY` (optional)
 * - `WAHA_SESSION` (optional)
 * - `WAHA_TIMEOUT_MS` (optional)
 * - `WAHA_RETRIES` (optional)
 */
export function wahaClientFromEnv(env: Record<string, string | undefined> = process.env): Result<WahaClientConfig> {
  const op = "wahaClientFromEnv"
  const baseUrl = env.WAHA_BASE_URL
  if (!baseUrl) {
    return createResultError(op, "WAHA_BASE_URL is required")
  }

  const timeoutRaw = env.WAHA_TIMEOUT_MS
  const retriesRaw = env.WAHA_RETRIES
  const timeoutMs = timeoutRaw !== undefined && timeoutRaw !== "" ? Number(timeoutRaw) : undefined
  const retries = retriesRaw !== undefined && retriesRaw !== "" ? Number(retriesRaw) : undefined

  return wahaClientConfig({
    baseUrl,
    apiKey: env.WAHA_API_KEY || undefined,
    session: env.WAHA_SESSION || undefined,
    timeoutMs: timeoutMs !== undefined && !Number.isNaN(timeoutMs) ? timeoutMs : undefined,
    retries: retries !== undefined && !Number.isNaN(retries) ? retries : undefined,
  })
}
