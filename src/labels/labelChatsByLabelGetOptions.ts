import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type LabelChatsByLabelGetOptions = {
  config: WahaClientConfig
  session?: string
  labelId: string
}
