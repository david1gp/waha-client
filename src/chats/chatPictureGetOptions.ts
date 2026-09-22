import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChatPictureGetOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  /** Refresh picture from server (24h cache by default) */
  refresh?: boolean
}

/** Returns `{ url }` JSON (not binary). */
