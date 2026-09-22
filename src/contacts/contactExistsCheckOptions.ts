import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ContactExistsCheckOptions = {
  config: WahaClientConfig
  session?: string
  phone: string
}

/** GET /api/contacts/check-exists?session=…&phone=… */
