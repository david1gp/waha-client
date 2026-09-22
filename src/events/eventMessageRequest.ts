import type { EventMessage } from "./eventMessage.js"

export type EventMessageRequest = {
  chatId: string
  event: EventMessage
  reply_to?: string
}
