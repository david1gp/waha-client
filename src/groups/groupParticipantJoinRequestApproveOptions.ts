import type { GroupParticipantRef } from "./groupParticipantRef.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupParticipantJoinRequestApproveOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  participants: GroupParticipantRef[]
}
