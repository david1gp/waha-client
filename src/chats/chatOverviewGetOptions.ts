import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChatOverviewGetOptions = {
  config: WahaClientConfig
  session?: string
  limit?: number
  offset?: number
  merge?: boolean
  /** Filter by chat ids (GET query `ids`) */
  ids?: string[]
}
