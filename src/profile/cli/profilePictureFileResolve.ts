import type { Result } from "#result"
import { mediaFileResolve } from "../../media/cli/mediaFileResolve.js"
import type { WahaFile } from "../../media/wahaFile.js"

export async function profilePictureFileResolve(file: string): Promise<Result<WahaFile>> {
  return mediaFileResolve(file, {
    fallbackMimetype: "image/jpeg",
    operation: "profilePictureFileResolve",
    localError: "Unable to read profile picture file",
  })
}
