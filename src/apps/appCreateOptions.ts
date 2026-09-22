import type { App } from "./app.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type AppCreateOptions = {
  config: WahaClientConfig
  body: App
}
