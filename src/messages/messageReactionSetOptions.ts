import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessageReactionSetOptions = {
  config: WahaClientConfig
  session?: string
  messageId: string
  /** Emoji; empty string removes the reaction */
  reaction: string
}
