import type { WahaPresenceStatus } from "./wahaPresenceStatus.js"

export type WahaSessionPresence = {
  presence: WahaPresenceStatus
  chatId?: string
}
