export type WahaEnvironment = {
  version: string
  engine: string
  tier: string
  browser: string
  platform: string
  worker: {
    id: string | null
  }
}
