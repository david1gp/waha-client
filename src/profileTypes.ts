/** GET /api/{session}/profile */
export type MyProfile = {
  id: string
  name: string
  picture: string | null
}

/** Shared WAHA success envelope */
export type WahaResult = {
  success: boolean
}

export type WahaRemoteFile = {
  mimetype: string
  filename?: string
  url: string
}

export type WahaBinaryFile = {
  mimetype: string
  filename?: string
  data: string
}

export type WahaFile = WahaRemoteFile | WahaBinaryFile
