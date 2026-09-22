import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChannelMessagePreviewGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  downloadMedia?: boolean
  limit?: number
}
