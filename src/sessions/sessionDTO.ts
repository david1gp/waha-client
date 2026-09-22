import type { SessionConfig } from "./sessionConfig.js"
import type { WahaSessionStatus } from "./wahaSessionStatus.js"

export type SessionDTO = {
  name: string
  status: WahaSessionStatus
  config?: SessionConfig
}
