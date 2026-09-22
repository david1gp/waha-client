import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupInfoAdminOnlyGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
