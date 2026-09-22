import type { ApiKeyRequest } from "./apiKeyRequest.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ApiKeyUpdateOptions = {
  config: WahaClientConfig
  id: string
  body?: ApiKeyRequest
}
