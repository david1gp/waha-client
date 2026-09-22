import type { WahaFile } from "../media/wahaFile.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type StatusImageSendOptions = {
  config: WahaClientConfig
  session?: string
  file: WahaFile
  caption?: string
  id?: string
  contacts?: string[]
}
