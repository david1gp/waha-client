import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type AuthPasskeyChallengeGetOptions = {
  config: WahaClientConfig
  session?: string
}
