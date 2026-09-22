import type { MeInfo } from "./meInfo.js"
import type { SessionDTO } from "./sessionDTO.js"
import type { WahaPresenceOnlineOffline } from "../presence/wahaPresenceOnlineOffline.js"

export type SessionInfo = SessionDTO & {
  me?: MeInfo
  assignedWorker?: string
  presence: WahaPresenceOnlineOffline | null
  timestamps: {
    activity: number | null
  }
  apps?: unknown[]
}
