import type { WahaRequestOptions } from "./wahaRequestOptions.js"
import { wahaRequestQueryString } from "./wahaRequestQueryString.js"

export function wahaRequestUrl(baseUrl: string, path: string, query?: WahaRequestOptions["query"]): string {
  return `${baseUrl}${path}${wahaRequestQueryString(query)}`
}
