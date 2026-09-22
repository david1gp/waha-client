import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ServerStopOptions = {
  config: WahaClientConfig
  force?: boolean
}
