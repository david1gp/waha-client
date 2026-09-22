import type { GroupParticipant } from "./groupParticipant.js"

export type GroupInfo = {
  jid: string
  name: string
  description?: string
  participants?: GroupParticipant[]
  invite?: string
  membersCanAddNewMember?: boolean
  membersCanSendMessages?: boolean
  newMembersApprovalRequired?: boolean
}
