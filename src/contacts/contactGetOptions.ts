import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ContactGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}

/** GET /api/{session}/contacts/{id} */
