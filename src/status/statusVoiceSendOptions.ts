import type { WahaFile } from "../media/wahaFile.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type StatusVoiceSendOptions = {
  config: WahaClientConfig
  session?: string
  file: WahaFile
  backgroundColor?: string
  convert?: boolean
  id?: string
  contacts?: string[]
}
