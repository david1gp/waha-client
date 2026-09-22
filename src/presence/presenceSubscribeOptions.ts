import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type PresenceSubscribeOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
}
