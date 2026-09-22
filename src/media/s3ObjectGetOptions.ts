import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type S3ObjectGetOptions = {
  config: WahaClientConfig
  bucket: string
  pathParts: string[]
}

/** GET /api/s3/{bucket}/*parts → object bytes. */
