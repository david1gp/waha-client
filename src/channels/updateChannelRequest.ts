import type { WahaFile } from "../media/wahaFile.js"

export type UpdateChannelRequest = {
  name?: string
  description?: string
  picture?: WahaFile | null
}
