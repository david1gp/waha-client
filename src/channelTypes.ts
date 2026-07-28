/** Types from WAHA channels.dto (response shapes; not fully validated). */

import type { WAMessage } from "./chattingTypes.js"
import type { WahaFile } from "./profileTypes.js"

export type ChannelRole = "OWNER" | "ADMIN" | "SUBSCRIBER" | "GUEST"

export type ChannelRoleFilter = "OWNER" | "ADMIN" | "SUBSCRIBER"

export type Channel = {
  id: string
  name: string
  description?: string
  invite: string
  preview?: string
  picture?: string
  verified: boolean
  subscribersCount: number
  role: ChannelRole
}

export type ChannelPublicInfo = {
  id: string
  name: string
  description?: string
  invite: string
  preview?: string
  picture?: string
  verified: boolean
  subscribersCount: number
}

export type ChannelCountry = {
  code: string
  name: string
}

export type ChannelCategory = {
  value: string
  name: string
}

export type ChannelView = {
  value: string
  name: string
}

export type ChannelPagination = {
  startCursor: string | null
  endCursor: string | null
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type ChannelListResult = {
  page: ChannelPagination
  channels: ChannelPublicInfo[]
}

export type ChannelMessage = {
  message: WAMessage
  reactions: Record<string, number>
  viewCount: number
}

export type CreateChannelRequest = {
  name: string
  description?: string
  picture?: WahaFile
}

export type ChannelSearchByView = {
  view?: string
  countries?: string[]
  categories?: string[]
  limit?: number
  startCursor?: string
}

export type ChannelSearchByText = {
  text: string
  categories?: string[]
  limit?: number
  startCursor?: string
}
