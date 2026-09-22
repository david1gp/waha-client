import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChatMessageReadOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  /** How many messages to read (latest first) */
  messages?: number
  /** How many days to read (latest first); server default 7 */
  days?: number
}
