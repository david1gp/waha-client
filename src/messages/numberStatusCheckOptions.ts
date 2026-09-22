import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type NumberStatusCheckOptions = {
  config: WahaClientConfig
  session?: string
  phone: string
}
