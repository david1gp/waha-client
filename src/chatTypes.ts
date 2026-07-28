/** Shared chat / message types for WAHA chats API */

export type SortOrder = "asc" | "desc"

export type ChatSortField = "conversationTimestamp" | "id" | "name"

export type MessageSortField = "timestamp" | "messageTimestamp"

export type WaMessageAckName = "ERROR" | "PENDING" | "SERVER" | "DEVICE" | "READ" | "PLAYED"

export type PinDuration = 86400 | 604800 | 2592000

/** GET /api/{session}/chats — chat list item (engine-dependent shape) */
export type ChatInfo = Record<string, unknown>

export type ChatSummary = {
  id: string
  name: string | null
  picture: string | null
  lastMessage: unknown
  _chat: unknown
}

export type ChatPictureResponse = {
  url: string | null
}

export type ReadChatMessagesResponse = {
  ids?: string[]
}

export type PinMessageResponse = {
  success: boolean
}

export type EditMessageRequest = {
  text: string
  mentions?: string[]
  linkPreview?: boolean
  linkPreviewHighQuality?: boolean
}

export type OverviewFilter = {
  ids?: string[]
}

export type OverviewBodyRequest = {
  pagination: {
    limit?: number
    offset?: number
    merge?: boolean
  }
  filter?: OverviewFilter
}
