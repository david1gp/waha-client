import type { QrCodeFormat } from "./qrCodeFormat.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type AuthQrGetOptions = {
  config: WahaClientConfig
  session?: string
  /** Default `"image"` → PNG bytes; `"raw"` → `{ value }`. */
  format?: QrCodeFormat
}
