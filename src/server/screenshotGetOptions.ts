import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ScreenshotGetOptions = {
  config: WahaClientConfig
  session?: string
}

/** GET /api/screenshot?session=… → JPEG bytes. */
