import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupJoinOptions = {
  config: WahaClientConfig
  session?: string
  code: string
}
