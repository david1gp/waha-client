import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupUnlinkOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  groupId: string
}
