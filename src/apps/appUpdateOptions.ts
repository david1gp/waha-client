import type { App } from "./app.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type AppUpdateOptions = {
  config: WahaClientConfig
  id: string
  body: App
}
