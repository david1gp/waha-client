import type { WahaClientConfig } from "./wahaClientConfigSchema.js"

export type WahaRequestOptions = {
  config: WahaClientConfig
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  query?: Record<string, string | number | boolean | readonly string[] | undefined | null>
  body?: unknown
  /** If true, inject config.session into body.session when body is object and session missing */
  injectSession?: boolean
  /** "json" (default) | "bytes" | "text" | "void" */
  responseType?: "json" | "bytes" | "text" | "void"
  headers?: Record<string, string>
}
