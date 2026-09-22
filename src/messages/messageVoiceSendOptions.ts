import type { WahaFile } from "../media/wahaFile.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessageVoiceSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  file: WahaFile
  reply_to?: string
  convert?: boolean
}
