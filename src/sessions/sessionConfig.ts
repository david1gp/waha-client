import type { ClientSessionConfig } from "./clientSessionConfig.js"
import type { GowsConfig } from "./gowsConfig.js"
import type { IgnoreConfig } from "./ignoreConfig.js"
import type { NowebConfig } from "./nowebConfig.js"
import type { ProxyConfig } from "./proxyConfig.js"
import type { WebhookConfig } from "./webhookConfig.js"
import type { WebjsConfig } from "./webjsConfig.js"

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
