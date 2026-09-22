import type { Result } from "#result"
import { mediaFileResolve } from "../../media/cli/mediaFileResolve.js"
import type { WahaFile } from "../../media/wahaFile.js"

export async function messageFileResolve(file: string, mimetype: string): Promise<Result<WahaFile>> {
  return mediaFileResolve(file, {
    fallbackMimetype: mimetype,
    inferMimetype: false,
    operation: "messageFileResolve",
    localError: "Unable to read local message file",
  })
}
