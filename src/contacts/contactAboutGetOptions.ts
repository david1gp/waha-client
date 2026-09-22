import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ContactAboutGetOptions = {
  config: WahaClientConfig
  session?: string
  contactId: string
}

/** GET /api/contacts/about?session=…&contactId=… */
