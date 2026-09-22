import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ProfileNameSetOptions = {
  config: WahaClientConfig
  session?: string
  name: string
}
