import type { WAMessage } from "../messages/waMessage.js"

export type ChannelMessage = {
  message: WAMessage
  reactions: Record<string, number>
  viewCount: number
}
