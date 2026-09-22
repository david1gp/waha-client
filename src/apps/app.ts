import type { AppName } from "./appName.js"

export type App = {
  id: string
  session: string
  app: AppName | string
  enabled?: boolean
  config: unknown
}
