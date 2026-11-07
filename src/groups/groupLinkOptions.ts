import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupLinkOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  groupId: string
}
