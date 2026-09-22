import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ContactUnblockOptions = {
  config: WahaClientConfig
  session?: string
  contactId: string
}

/** POST /api/contacts/unblock — injects session into body. */
