import type { WahaPresenceStatus } from "./wahaPresenceStatus.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type PresenceSetOptions = {
  config: WahaClientConfig
  session?: string
  presence: WahaPresenceStatus
  chatId?: string
}
