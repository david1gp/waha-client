import type { ChannelPagination } from "./channelPagination.js"
import type { ChannelPublicInfo } from "./channelPublicInfo.js"

export type ChannelListResult = {
  page: ChannelPagination
  channels: ChannelPublicInfo[]
}
