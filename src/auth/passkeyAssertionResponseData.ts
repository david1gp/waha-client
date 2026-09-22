export type PasskeyAssertionResponseData = {
  clientDataJSON: string
  authenticatorData: string
  signature: string
  userHandle?: string
}
