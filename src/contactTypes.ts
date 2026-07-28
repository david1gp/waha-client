/** Contact object returned by WAHA contacts endpoints. */
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
export type WANumberExistResult = {
  numberExists: boolean
  chatId?: string
}

/** GET /api/contacts/about */
export type ContactAbout = {
  about: string | null
}

/** GET /api/contacts/profile-picture */
export type ContactProfilePicture = {
  profilePictureURL: string | null
}

/** PUT /api/{session}/contacts/{chatId} body */
export type ContactUpdateBody = {
  firstName: string
  lastName: string
}

/** GET /api/{session}/lids → LidToPhoneNumber */
export type LidToPhoneNumber = {
  lid?: string | null
  pn?: string | null
}

/** GET /api/{session}/lids/count */
export type CountResponse = {
  count: number
}

export type ContactSortField = "id" | "name"
export type { SortOrder } from "./chatTypes.js"
