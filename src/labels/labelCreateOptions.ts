import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type LabelCreateOptions = {
  config: WahaClientConfig
  session?: string
  name: string
  colorHex?: string
  color?: number
}
