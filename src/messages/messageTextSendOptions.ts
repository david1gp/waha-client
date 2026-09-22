import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessageTextSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  text: string
  id?: string
  mentions?: string[]
  reply_to?: string
  linkPreview?: boolean
  linkPreviewHighQuality?: boolean
}
