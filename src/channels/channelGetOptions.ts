import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChannelGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
