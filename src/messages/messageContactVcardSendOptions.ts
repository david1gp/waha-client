import type { MessageContact } from "./messageContact.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MessageContactVcardSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  contacts: MessageContact[]
  id?: string
  reply_to?: string
}
