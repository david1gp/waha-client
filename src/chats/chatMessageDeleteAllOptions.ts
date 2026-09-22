import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChatMessageDeleteAllOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
}
