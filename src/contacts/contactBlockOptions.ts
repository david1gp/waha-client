import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ContactBlockOptions = {
  config: WahaClientConfig
  session?: string
  contactId: string
}

/** POST /api/contacts/block — injects session into body. */
