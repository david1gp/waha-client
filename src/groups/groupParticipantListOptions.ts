import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupParticipantListOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
