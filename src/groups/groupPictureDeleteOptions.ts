import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupPictureDeleteOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
