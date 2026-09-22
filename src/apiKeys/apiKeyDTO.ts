import type { SessionActions } from "./sessionActions.js"

export type ApiKeyDTO = {
  id: string
  key: string
  isActive: boolean
  isAdmin: boolean
  session: string | null
  actions: SessionActions | null
}
