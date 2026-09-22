import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ContactProfilePictureGetOptions = {
  config: WahaClientConfig
  session?: string
  contactId: string
  refresh?: boolean
}

/** GET /api/contacts/profile-picture?session=…&contactId=…&refresh=… */
