import type { ContactSortField } from "./contactSortField.js"
import type { SortOrder } from "../chats/sortOrder.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ContactListAllOptions = {
  config: WahaClientConfig
  session?: string
  limit?: number
  offset?: number
  sortBy?: ContactSortField
  sortOrder?: SortOrder
}

/** GET /api/contacts/all?session=… */
