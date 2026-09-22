import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupInviteCodeGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
