import type { GroupSortField } from "./groupSortField.js"
import type { GroupSortOrder } from "./groupSortOrder.js"

export type GroupsPagination = {
  limit?: number
  offset?: number
  sortBy?: GroupSortField | string
  sortOrder?: GroupSortOrder
}
