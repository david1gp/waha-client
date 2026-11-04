import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupMemberShareHistoryModeSetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  membersCanShareHistory: boolean
}
