import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChannelSearchByViewOptions = {
  config: WahaClientConfig
  session?: string
  view?: string
  countries?: string[]
  categories?: string[]
  limit?: number
  startCursor?: string
}
