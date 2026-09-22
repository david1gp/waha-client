import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type TypingStartOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
}
