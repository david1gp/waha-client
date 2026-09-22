import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessageStarSetOptions = {
  config: WahaClientConfig
  session?: string
  messageId: string
  chatId: string
  star: boolean
}
