/** Types for WAHA events domain. */

export type EventLocation = {
  name: string
}

export type EventMessage = {
  name: string
  description?: string
  startTime: number
  endTime?: number
  location?: EventLocation
  extraGuestsAllowed?: boolean
}

export type EventMessageRequest = {
  chatId: string
  event: EventMessage
  reply_to?: string
}
