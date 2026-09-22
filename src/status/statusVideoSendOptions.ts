import type { WahaFile } from "../media/wahaFile.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type StatusVideoSendOptions = {
  config: WahaClientConfig
  session?: string
  file: WahaFile
  caption?: string
  convert?: boolean
  id?: string
  contacts?: string[]
}
