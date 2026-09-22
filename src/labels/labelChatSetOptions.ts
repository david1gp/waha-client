import type { LabelID } from "./labelID.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type LabelChatSetOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  labels: LabelID[]
}
