export type EditMessageRequest = {
  text: string
  mentions?: string[]
  linkPreview?: boolean
  linkPreviewHighQuality?: boolean
}
