/** Types for WAHA chatting / message send domain. */

import type { WahaFile } from "./profileTypes.js"

export type { WahaFile, WahaBinaryFile, WahaRemoteFile } from "./profileTypes.js"

export type WAMessage = {
  id: string
  timestamp: number
  from: string
  fromMe: boolean
  source?: string
  to: string
  participant?: string
  body?: string
  hasMedia?: boolean
  media?: unknown
  mediaUrl?: string
  ack?: number
  ackName?: string
  author?: string
  location?: {
    latitude: string
    longitude: string
    live?: boolean
    name?: string
    address?: string
    url?: string
    description?: string
    thumbnail?: string
  }
  vCards?: string[]
  replyTo?: unknown
  _data?: unknown
}

export type { WANumberExistResult } from "./contactTypes.js"

export type NewMessageIDResponse = {
  id: string
}

export type TypingResult = {
  result: boolean
}

export type ButtonType = "reply" | "url" | "call" | "copy"

export type MessageButton = {
  type: ButtonType
  text: string
  id?: string
  url?: string
  phoneNumber?: string
  copyCode?: string
}

export type MessagePoll = {
  name: string
  options: string[]
  multipleAnswers?: boolean
}

export type MessageListRow = {
  title: string
  description?: string
  rowId: string
}

export type MessageListSection = {
  title: string
  rows: MessageListRow[]
}

export type MessageListMessage = {
  title: string
  description?: string
  footer?: string
  button: string
  sections: MessageListSection[]
}

export type LinkPreviewData = {
  url: string
  title: string
  description: string
  image?: WahaFile
}

export type ContactVcard = {
  vcard: string
}

export type ContactStructured = {
  fullName: string
  organization?: string
  phoneNumber: string
  whatsappId?: string
  vcard?: string | null
}

export type MessageContact = ContactVcard | ContactStructured
