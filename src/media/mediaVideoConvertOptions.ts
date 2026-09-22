import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MediaVideoConvertOptions = {
  config: WahaClientConfig
  session?: string
  url?: string
  data?: string
}

/** POST /api/{session}/media/convert/video → mp4 bytes. */
