import type { EventLocation } from "./eventLocation.js"

export type EventMessage = {
  name: string
  description?: string
  startTime: number
  endTime?: number
  location?: EventLocation
  extraGuestsAllowed?: boolean
}
