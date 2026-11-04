import type { PhoneNumbersAppName } from "./phoneNumbersAppName.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type PhoneNumbersCacheDbGetOptions = {
  config: WahaClientConfig
  session?: string
  app?: PhoneNumbersAppName
  limit?: number
  offset?: number
}
