import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChannelFollowOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
