import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ServerDebugBrowserTraceGetOptions = {
  config: WahaClientConfig
  session?: string
  seconds: number
  categories?: string[]
}
