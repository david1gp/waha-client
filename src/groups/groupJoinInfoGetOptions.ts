import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupJoinInfoGetOptions = {
  config: WahaClientConfig
  session?: string
  code: string
}
