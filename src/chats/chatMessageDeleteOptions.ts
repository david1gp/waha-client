import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChatMessageDeleteOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  messageId: string
}
