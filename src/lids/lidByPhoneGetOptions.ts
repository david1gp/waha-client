import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type LidByPhoneGetOptions = {
  config: WahaClientConfig
  session?: string
  phoneNumber: string
}

/** GET /api/{session}/lids/pn/{phoneNumber} */
