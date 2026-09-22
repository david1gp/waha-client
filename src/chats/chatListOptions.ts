import type { ChatSortField } from "./chatSortField.js"
import type { SortOrder } from "./sortOrder.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChatListOptions = {
  config: WahaClientConfig
  session?: string
  limit?: number
  offset?: number
  sortBy?: ChatSortField
  sortOrder?: SortOrder
  merge?: boolean
}
