import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type LabelUpdateOptions = {
  config: WahaClientConfig
  session?: string
  labelId: string
  name: string
  colorHex?: string
  color?: number
}
