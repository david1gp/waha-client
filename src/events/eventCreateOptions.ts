import type { EventMessage } from "./eventMessage.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type EventCreateOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  event: EventMessage
  reply_to?: string
}
