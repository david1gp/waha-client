import type { LidToPhoneNumber } from "../lids/lidToPhoneNumber.js"

export type ContactUpdateBody = {
  firstName: string
  lastName: string
}

/** GET /api/{session}/lids → LidToPhoneNumber */
