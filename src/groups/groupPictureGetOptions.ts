import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupPictureGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  refresh?: boolean
}
