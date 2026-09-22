export type Contact = {
  id: string
  number?: string
  name?: string
  pushname?: string
  shortName?: string
  isMe?: boolean
  isGroup?: boolean
  isWAContact?: boolean
  isMyContact?: boolean
  isBlocked?: boolean
  [key: string]: unknown
}

/** GET /api/contacts/check-exists (also used by checkNumberStatus) */
