import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChannelMuteOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
