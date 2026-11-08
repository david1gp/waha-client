import type { WahaFile } from "../media/wahaFile.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChannelUpdateOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  name?: string
  description?: string
  picture?: WahaFile | null
}
