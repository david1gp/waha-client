import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessageLocationSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  latitude: number
  longitude: number
  title: string
  id?: string
  reply_to?: string
}
