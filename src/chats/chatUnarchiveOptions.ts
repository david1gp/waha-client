import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ChatUnarchiveOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
}
