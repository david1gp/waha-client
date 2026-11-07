import type { GroupParticipantRef } from "./groupParticipantRef.js"

export type GroupCreateRequest = {
  name: string
  participants: GroupParticipantRef[]
  isParent?: boolean
  linkedParentId?: string
}
