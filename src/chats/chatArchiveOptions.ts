import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChatArchiveOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
}
