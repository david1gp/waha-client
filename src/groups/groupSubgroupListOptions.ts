import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupSubgroupListOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
