import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessagesGetOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  downloadMedia?: boolean
  merge?: boolean
  "filter.timestamp.lte"?: number
  "filter.timestamp.gte"?: number
  "filter.fromMe"?: boolean
  "filter.ack"?: string
}
