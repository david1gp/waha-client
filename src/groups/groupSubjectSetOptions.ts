import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupSubjectSetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  subject: string
}
