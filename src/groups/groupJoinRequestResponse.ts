export type GroupJoinRequestResponse = {
  requesterId: string
  requesterPn?: string | null
  addedById: string | null
  parentGroupId: string | null
  requestMethod: string | null
  timestamp: number
}
