import type { GroupParticipantRole } from "./groupParticipantRole.js"

export type GroupParticipant = {
  id: string
  pn?: string
  role: GroupParticipantRole
}
