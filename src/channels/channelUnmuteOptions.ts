import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChannelUnmuteOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
