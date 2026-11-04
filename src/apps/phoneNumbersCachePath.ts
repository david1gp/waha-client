import type { PhoneNumbersAppName } from "./phoneNumbersAppName.js"
import { wahaPathApi } from "../client/wahaPathApi.js"

export function phoneNumbersCachePath(
  app: PhoneNumbersAppName,
  session: string,
  tier: "db" | "memory" | "stats" | "purge",
): string {
  return wahaPathApi(`/apps/${app}/${encodeURIComponent(session)}/cache/${tier}`)
}
