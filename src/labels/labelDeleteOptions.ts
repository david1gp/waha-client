import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type LabelDeleteOptions = {
  config: WahaClientConfig
  session?: string
  labelId: string
}
