import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChannelSearchByTextOptions = {
  config: WahaClientConfig
  session?: string
  text: string
  categories?: string[]
  limit?: number
  startCursor?: string
}
