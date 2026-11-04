import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupMemberShareHistoryModeGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
