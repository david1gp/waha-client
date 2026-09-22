/** Event envelope emitted by WAHA over its WebSocket endpoint. */
export type WahaWebSocketEvent<TPayload = unknown> = {
  id?: string
  timestamp?: number
  event: string
  session: string
  metadata?: Record<string, unknown>
  me?: unknown
  payload: TPayload
  environment?: unknown
  engine?: string
}
