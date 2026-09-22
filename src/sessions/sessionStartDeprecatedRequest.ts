import type { SessionConfig } from "./sessionConfig.js"

export type SessionStartDeprecatedRequest = {
  name: string
  config?: SessionConfig
}
