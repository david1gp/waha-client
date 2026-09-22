import type { ButtonType } from "./buttonType.js"

export type MessageButton = {
  type: ButtonType
  text: string
  id?: string
  url?: string
  phoneNumber?: string
  copyCode?: string
}
