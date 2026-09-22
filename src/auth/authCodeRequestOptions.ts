import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type AuthCodeRequestOptions = {
  config: WahaClientConfig
  session?: string
  phoneNumber: string
  method?: string
  localeLanguage?: string
  localeCountry?: string
}
