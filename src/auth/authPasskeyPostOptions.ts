import type { PasskeyAssertionRequest } from "./passkeyAssertionRequest.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type AuthPasskeyPostOptions = {
  config: WahaClientConfig
  session?: string
} & PasskeyAssertionRequest
