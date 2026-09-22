import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessageButtonsReplyOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  replyTo: string
  selectedDisplayText: string
  selectedButtonID: string
}
