import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type MediaVoiceConvertOptions = {
  config: WahaClientConfig
  session?: string
  url?: string
  data?: string
}

/** POST /api/{session}/media/convert/voice → opus bytes. */
