import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupMembershipApprovalSetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  newMembersApprovalRequired: boolean
}
