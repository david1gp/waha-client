export type WAMessage = {
  id: string
  timestamp: number
  from: string
  fromMe: boolean
  source?: string
  to: string
  participant?: string
  body?: string
  hasMedia?: boolean
  media?: unknown
  mediaUrl?: string
  ack?: number
  ackName?: string
  author?: string
  location?: {
    latitude: string
    longitude: string
    live?: boolean
    name?: string
    address?: string
    url?: string
    description?: string
    thumbnail?: string
  }
  vCards?: string[]
  replyTo?: unknown
  _data?: unknown
}
