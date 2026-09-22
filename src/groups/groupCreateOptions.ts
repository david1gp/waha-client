import type { GroupCreateRequest } from "./groupCreateRequest.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupCreateOptions = {
  config: WahaClientConfig
  session?: string
  name: string
  participants: GroupCreateRequest["participants"]
}
