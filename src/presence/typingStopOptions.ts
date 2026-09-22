import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type TypingStopOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
}
