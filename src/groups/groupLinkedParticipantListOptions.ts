import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupLinkedParticipantListOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
