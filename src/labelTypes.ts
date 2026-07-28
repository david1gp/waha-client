/** Types from WAHA labels.dto (response shapes; not fully validated). */

export type Label = {
  id: string
  name: string
  color: number
  colorHex: string
}

export type LabelBody = {
  name: string
  colorHex?: string
  color?: number
}

export type LabelID = {
  id: string
}

export type SetLabelsRequest = {
  labels: LabelID[]
}

export type LabelDeleteResult = {
  result: boolean
}
