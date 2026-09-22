import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupMessagesAdminOnlySetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  adminsOnly: boolean
}
