import type { WahaFile } from "../media/wahaFile.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupPictureSetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  file: WahaFile
}
