export type PingResponse = {
  message: string
}

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

export type ServerStatusResponse = {
  startTimestamp: number
  uptime: number
  worker: {
    id: string
  }
}

export type StopResponse = {
  stopping: boolean
}

/** NestJS terminus health check payload (shape varies by indicators). */
export type HealthCheckResponse = {
  status: string
  info?: Record<string, unknown>
  error?: Record<string, unknown>
  details?: Record<string, unknown>
}
