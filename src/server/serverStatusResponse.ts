export type ServerStatusResponse = {
  startTimestamp: number
  uptime: number
  worker: {
    id: string
  }
}
