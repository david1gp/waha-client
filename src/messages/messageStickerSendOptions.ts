import type { WahaFile } from "../media/wahaFile.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessageStickerSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  file: WahaFile
  reply_to?: string
}
