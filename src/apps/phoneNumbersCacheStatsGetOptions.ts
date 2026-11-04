import type { PhoneNumbersAppName } from "./phoneNumbersAppName.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type PhoneNumbersCacheStatsGetOptions = {
  config: WahaClientConfig
  session?: string
  app?: PhoneNumbersAppName
}
