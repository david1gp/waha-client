import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupParticipantTagsGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
