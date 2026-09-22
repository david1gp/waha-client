import type { WahaPresenceStatus } from "./wahaPresenceStatus.js"

export type WahaPresenceData = {
  participant: string
  lastKnownPresence: WahaPresenceStatus
  lastSeen?: number
}
