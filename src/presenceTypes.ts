/** Types from WAHA presence.dto / enums.dto (response shapes; not fully validated). */

export type WahaPresenceStatus = "offline" | "online" | "typing" | "recording" | "paused"

export type WahaPresenceData = {
  participant: string
  lastKnownPresence: WahaPresenceStatus
  lastSeen?: number
}

export type WahaChatPresences = {
  id: string
  presences: WahaPresenceData[]
}

export type WahaSessionPresence = {
  presence: WahaPresenceStatus
  chatId?: string
}
