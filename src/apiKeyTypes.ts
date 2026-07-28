export type SessionActions = {
  read?: boolean
  send?: boolean
  control?: boolean
  setting?: boolean
  app?: boolean
  delete?: boolean
}

export type ApiKeyDTO = {
  id: string
  key: string
  isActive: boolean
  isAdmin: boolean
  session: string | null
  actions: SessionActions | null
}

export type ApiKeyRequest = {
  isAdmin?: boolean
  session?: string | null
  isActive?: boolean
  actions?: SessionActions | null
}

export type ScopedApiKeyRequest = {
  session: string
}

export type ApiKeyDeleteResult = {
  result: true
}
