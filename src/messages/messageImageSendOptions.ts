import type { WahaFile } from "../media/wahaFile.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessageImageSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  file: WahaFile
  caption?: string
  mentions?: string[]
  reply_to?: string
}
