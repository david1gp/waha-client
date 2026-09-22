import type { PinDuration } from "./pinDuration.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChatMessagePinOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  messageId: string
  /** Seconds: 86400 (day), 604800 (week), 2592000 (month) */
  duration: PinDuration
}
