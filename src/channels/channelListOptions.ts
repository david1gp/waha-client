import type { ChannelRoleFilter } from "./channelRoleFilter.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChannelListOptions = {
  config: WahaClientConfig
  session?: string
  role?: ChannelRoleFilter
}
