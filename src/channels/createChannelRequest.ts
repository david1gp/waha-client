import type { WahaFile } from "../media/wahaFile.js"

export type CreateChannelRequest = {
  name: string
  description?: string
  picture?: WahaFile
}
