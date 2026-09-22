import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ServerEnvironmentGetOptions = {
  config: WahaClientConfig
  /** Include all env vars (default: WAHA_*, WHATSAPP_*, DEBUG only). */
  all?: boolean
}
