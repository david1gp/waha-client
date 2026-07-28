export type AppName = "chatwoot" | "calls" | "mcp"

export type App = {
  id: string
  session: string
  app: AppName | string
  enabled?: boolean
  config: unknown
}

export type ChatwootLocale = {
  name: string
  locale: string
}
