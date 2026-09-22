import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChatDeleteOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
}
