import type { Result } from "#result"
import { mediaFileResolve } from "../../media/cli/mediaFileResolve.js"
import type { WahaFile } from "../../media/wahaFile.js"

export async function groupPictureFileResolve(file: string): Promise<Result<WahaFile>> {
  return mediaFileResolve(file, {
    fallbackMimetype: "image/jpeg",
    inferRemoteMimetype: false,
    operation: "groupPictureFileResolve",
    localError: "Unable to read local group picture",
  })
}
