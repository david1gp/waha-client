import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupMessagesAdminOnlyGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
