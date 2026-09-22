import type { MessageButton } from "./messageButton.js"
import type { WahaFile } from "../media/wahaFile.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessageButtonsSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  header?: string
  headerImage?: WahaFile
  body?: string
  footer?: string
  buttons: MessageButton[]
}
