import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupInfoAdminOnlySetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  adminsOnly: boolean
}
