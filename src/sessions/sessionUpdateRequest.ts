import type { SessionConfig } from "./sessionConfig.js"

export type SessionUpdateRequest = {
  config?: SessionConfig
  apps?: unknown[] | null
}
