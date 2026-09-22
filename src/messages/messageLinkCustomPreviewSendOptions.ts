import type { LinkPreviewData } from "./linkPreviewData.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessageLinkCustomPreviewSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  text: string
  preview: LinkPreviewData
  linkPreviewHighQuality?: boolean
  reply_to?: string
}
