import type { ApiKeyRequest } from "./apiKeyRequest.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ApiKeyCreateOptions = {
  config: WahaClientConfig
  body?: ApiKeyRequest
}
