import type { PhoneNumbersAppName } from "./phoneNumbersAppName.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type PhoneNumbersCacheMemoryGetOptions = {
  config: WahaClientConfig
  session?: string
  app?: PhoneNumbersAppName
  limit?: number
  offset?: number
}
