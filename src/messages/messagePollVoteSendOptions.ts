import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessagePollVoteSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  pollMessageId: string
  votes: string[]
  pollServerId?: number
}
