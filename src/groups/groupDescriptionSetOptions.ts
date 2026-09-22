import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupDescriptionSetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  description: string
}
