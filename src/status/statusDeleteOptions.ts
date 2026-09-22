import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type StatusDeleteOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  contacts?: string[]
}
