import type { MessageSortField } from "../messages/messageSortField.js"
import type { SortOrder } from "./sortOrder.js"
import type { WaMessageAckName } from "./waMessageAckName.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChatMessageListOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  limit?: number
  offset?: number
  sortBy?: MessageSortField
  sortOrder?: SortOrder
  downloadMedia?: boolean
  merge?: boolean
  filterTimestampLte?: number
  filterTimestampGte?: number
  filterFromMe?: boolean
  filterAck?: WaMessageAckName
}
