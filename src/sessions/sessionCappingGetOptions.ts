import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type SessionCappingGetOptions = {
  config: WahaClientConfig
  session?: string
}
