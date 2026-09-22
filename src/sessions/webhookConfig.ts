export type WebhookConfig = {
  url: string
  events?: string[]
  hmac?: { key?: string }
  retries?: {
    delaySeconds?: number
    attempts?: number
    policy?: "linear" | "exponential" | "constant"
  }
  customHeaders?: Array<{ name: string; value: string }>
}
