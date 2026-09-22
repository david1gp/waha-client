import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupParticipantListV2Options = {
  config: WahaClientConfig
  session?: string
  id: string
}
