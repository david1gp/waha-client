import * as a from "valibot"

export const phoneNumbersAppNameSchema = a.picklist([
  "phone-numbers",
  "brazilian-phone-numbers",
  "argentine-phone-numbers",
  "mexican-phone-numbers",
] as const)
