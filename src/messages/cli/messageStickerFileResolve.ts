import type { Result } from "#result"
import { mediaFileResolve } from "../../media/cli/mediaFileResolve.js"
import type { WahaFile } from "../../media/wahaFile.js"

export async function messageStickerFileResolve(file: string): Promise<Result<WahaFile>> {
  return mediaFileResolve(file, {
    fallbackMimetype: "image/webp",
    inferMimetype: false,
    operation: "messageStickerFileResolve",
    localError: "Unable to read local WebP file",
  })
}
