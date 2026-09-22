import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupMemberAddModeGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
