import type { SessionActions } from "./sessionActions.js"

export type ApiKeyRequest = {
  isAdmin?: boolean
  session?: string | null
  isActive?: boolean
  actions?: SessionActions | null
}
