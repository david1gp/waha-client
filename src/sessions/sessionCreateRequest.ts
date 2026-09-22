import type { SessionConfig } from "./sessionConfig.js"

export type SessionCreateRequest = {
  name?: string
  config?: SessionConfig
  apps?: unknown[] | null
  start?: boolean
}
