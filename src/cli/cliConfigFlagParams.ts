/** Shared optional flags that override env. */
export const cliConfigFlagParams = {
  baseUrl: {
    kind: "parsed" as const,
    parse: String,
    optional: true as const,
    brief: "Override WAHA_BASE_URL",
  },
  apiKey: {
    kind: "parsed" as const,
    parse: String,
    optional: true as const,
    brief: "Override WAHA_API_KEY",
  },
  session: {
    kind: "parsed" as const,
    parse: String,
    optional: true as const,
    brief: "Override WAHA_SESSION",
  },
}
