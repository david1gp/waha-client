import type { ChannelRole } from "./channelRole.js"

export type Channel = {
  id: string
  name: string
  description?: string
  invite: string
  preview?: string
  picture?: string
  verified: boolean
  subscribersCount: number
  role: ChannelRole
}
