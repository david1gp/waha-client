import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ProfileStatusSetOptions = {
  config: WahaClientConfig
  session?: string
  status: string
}
