import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type PresenceGetOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
}
