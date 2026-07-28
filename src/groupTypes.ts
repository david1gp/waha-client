export type GroupParticipantRole = "left" | "participant" | "admin" | "superadmin"

export type GroupParticipant = {
  id: string
  pn?: string
  role: GroupParticipantRole
}

export type GroupInfo = {
  id: string
  subject: string
  description: string
  participants: GroupParticipant[]
  invite?: string
  membersCanAddNewMember: boolean
  membersCanSendMessages: boolean
  newMembersApprovalRequired: boolean
}

export type GroupParticipantRef = {
  id: string
}

export type GroupCreateRequest = {
  name: string
  participants: GroupParticipantRef[]
}

export type GroupJoinRequest = {
  code: string
}

export type GroupJoinResponse = {
  id: string
}

export type GroupField = "" | "participants"

export type GroupSortField = "id" | "subject"

export type GroupSortOrder = "asc" | "desc"

export type GroupsPagination = {
  limit?: number
  offset?: number
  sortBy?: GroupSortField | string
  sortOrder?: GroupSortOrder
}

export type GroupsListFields = {
  exclude?: GroupField[] | string[]
}

export type CountResponse = {
  count: number
}

export type GroupRefreshResponse = {
  success: boolean
}

export type SettingsSecurityChangeInfo = {
  adminsOnly: boolean
}

export type ChatPictureResponse = {
  url: string | null
}

export type ParticipantsRequest = {
  participants: GroupParticipantRef[]
}
