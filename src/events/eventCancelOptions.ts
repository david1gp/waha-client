import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type EventCancelOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}

/** POST /api/{session}/events/{id}/cancel — may be disabled upstream; path matches WAHA DTO. */
