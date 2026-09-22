import type { WahaFile } from "../media/wahaFile.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ProfilePictureSetOptions = {
  config: WahaClientConfig
  session?: string
  file: WahaFile
}
