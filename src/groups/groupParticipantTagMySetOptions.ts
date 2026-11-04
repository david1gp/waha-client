import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupParticipantTagMySetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  tag: string | null
}
