import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type StatusTextSendOptions = {
  config: WahaClientConfig
  session?: string
  text: string
  backgroundColor?: string
  font?: number
  linkPreview?: boolean
  linkPreviewHighQuality?: boolean
  id?: string
  contacts?: string[]
}
