import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChatUnreadOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
}
