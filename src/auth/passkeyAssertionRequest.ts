import type { PasskeyAssertionResponseData } from "./passkeyAssertionResponseData.js"

export type PasskeyAssertionRequest = {
  id: string
  rawId: string
  type: string
  response: PasskeyAssertionResponseData
}
