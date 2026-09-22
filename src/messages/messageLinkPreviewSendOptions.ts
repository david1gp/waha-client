import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessageLinkPreviewSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  url: string
  title: string
  id?: string
}
