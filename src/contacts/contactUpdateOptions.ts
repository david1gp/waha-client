import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ContactUpdateOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  firstName: string
  lastName: string
}

/** PUT /api/{session}/contacts/{chatId} */
