import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupParticipantJoinRequestListOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
