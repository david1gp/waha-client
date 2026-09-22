import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChannelDeleteOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
