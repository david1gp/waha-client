import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ContactListOptions = {
  config: WahaClientConfig
  session?: string
  contactId: string
}

/** GET /api/contacts?session=…&contactId=… */
