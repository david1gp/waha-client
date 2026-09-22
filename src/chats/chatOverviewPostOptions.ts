import type { OverviewBodyRequest } from "./overviewBodyRequest.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChatOverviewPostOptions = {
  config: WahaClientConfig
  session?: string
  pagination: OverviewBodyRequest["pagination"]
  filter?: OverviewBodyRequest["filter"]
}
