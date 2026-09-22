import type { GroupsListFields } from "./groupsListFields.js"
import type { GroupsPagination } from "./groupsPagination.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupListOptions = {
  config: WahaClientConfig
  session?: string
} & GroupsPagination &
  GroupsListFields
