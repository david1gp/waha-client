import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChatMessageGetOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  messageId: string
  downloadMedia?: boolean
  merge?: boolean
}
