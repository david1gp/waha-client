import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupParticipantTagGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  participantId: string
}
