import type { MessageListSection } from "./messageListSection.js"

export type MessageListMessage = {
  title: string
  description?: string
  footer?: string
  button: string
  sections: MessageListSection[]
}
