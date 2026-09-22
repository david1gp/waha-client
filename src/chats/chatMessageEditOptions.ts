import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChatMessageEditOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  messageId: string
  text: string
  mentions?: string[]
  linkPreview?: boolean
  linkPreviewHighQuality?: boolean
}
