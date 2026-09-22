import type { Result } from "#result"
import { mediaFileResolve } from "../../media/cli/mediaFileResolve.js"
import type { WahaFile } from "../../media/wahaFile.js"

const STATUS_MIME_TYPES: Readonly<Record<string, string>> = {
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".ogg": "audio/ogg",
  ".png": "image/png",
  ".wav": "audio/wav",
  ".webm": "video/webm",
  ".webp": "image/webp",
}

export async function statusFileResolve(file: string, fallbackMimetype: string): Promise<Result<WahaFile>> {
  return mediaFileResolve(file, {
    fallbackMimetype,
    extraMimeTypes: STATUS_MIME_TYPES,
    operation: "statusFileResolve",
    localError: "Unable to read local status file",
  })
}
