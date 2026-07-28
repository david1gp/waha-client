/** Types from WAHA sessions.dto / enums.dto (response shapes; not fully validated). */

export type WahaSessionStatus =
  | "STOPPED"
  | "STARTING"
  | "SCAN_QR_CODE"
  | "PASSKEY_REQUIRED"
  | "PASSKEY_CONFIRMATION_REQUIRED"
  | "WORKING"
  | "FAILED"

export type WahaPresenceOnlineOffline = "online" | "offline"

export type SessionExpand = "apps"

export type ProxyConfig = {
  server: string
  username?: string
  password?: string
}

export type NowebStoreConfig = {
  enabled?: boolean
  fullSync?: boolean
}

export type NowebConfig = {
  store?: NowebStoreConfig
  markOnline?: boolean
}

export type GowsStorageConfig = {
  messages?: boolean | null
  groups?: boolean | null
  chats?: boolean | null
  labels?: boolean | null
}

export type GowsConfig = {
  storage?: GowsStorageConfig
}

export type WebjsConfig = {
  tagsEventsOn?: boolean
}

export type IgnoreConfig = {
  status?: boolean
  groups?: boolean
  channels?: boolean
  broadcast?: boolean
}

export type ClientSessionConfig = {
  deviceName?: string
  browserName?: string
}

export type WebhookConfig = {
  url: string
  events?: string[]
  hmac?: { key?: string }
  retries?: {
    delaySeconds?: number
    attempts?: number
    policy?: "linear" | "exponential" | "constant"
  }
  customHeaders?: Array<{ name: string; value: string }>
}

export type SessionConfig = {
  webhooks?: WebhookConfig[]
  metadata?: Record<string, string>
  proxy?: ProxyConfig
  debug?: boolean
  ignore?: IgnoreConfig
  client?: ClientSessionConfig
  noweb?: NowebConfig
  gows?: GowsConfig
  webjs?: WebjsConfig
}

export type SessionDTO = {
  name: string
  status: WahaSessionStatus
  config?: SessionConfig
}

export type MeInfo = {
  id: string
  lid?: string
  jid?: string
  pushName: string
}

export type SessionInfo = SessionDTO & {
  me?: MeInfo
  assignedWorker?: string
  presence: WahaPresenceOnlineOffline | null
  timestamps: {
    activity: number | null
  }
  apps?: unknown[]
}

export type SessionCreateRequest = {
  name?: string
  config?: SessionConfig
  apps?: unknown[] | null
  start?: boolean
}

export type SessionUpdateRequest = {
  config?: SessionConfig
  apps?: unknown[] | null
}

export type SessionStartDeprecatedRequest = {
  name: string
  config?: SessionConfig
}

export type SessionStopDeprecatedRequest = {
  name: string
  logout?: boolean
}

export type SessionLogoutDeprecatedRequest = {
  name: string
}
