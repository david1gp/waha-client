import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupMembershipApprovalGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
