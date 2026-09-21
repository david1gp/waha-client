export type MessageCappingData = {
  cappingStatus: string
  totalQuota: number
  usedQuota: number
  cycleStart: number | null
  cycleEnd: number | null
  mvStatus: string | null
  oteStatus: string | null
}
