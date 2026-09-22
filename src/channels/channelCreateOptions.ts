import type { WahaFile } from "../media/wahaFile.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChannelCreateOptions = {
  config: WahaClientConfig
  session?: string
  name: string
  description?: string
  picture?: WahaFile
}
