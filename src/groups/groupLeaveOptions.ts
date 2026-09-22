import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupLeaveOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
