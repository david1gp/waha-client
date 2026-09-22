import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessageForwardOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  messageId: string
  id?: string
}
