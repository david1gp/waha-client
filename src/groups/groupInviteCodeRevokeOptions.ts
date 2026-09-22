import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupInviteCodeRevokeOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
