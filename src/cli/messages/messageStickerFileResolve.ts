import { readFile } from "node:fs/promises"
import { basename } from "node:path"
import { createResult, createResultError, type Result } from "#result"
import type { WahaFile } from "../../profileTypes.js"

export async function messageStickerFileResolve(file: string): Promise<Result<WahaFile>> {
  const op = "messageStickerFileResolve"
  if (/^https?:\/\//i.test(file)) return createResult({ mimetype: "image/webp", url: file })

  try {
    const data = await readFile(file)
    return createResult({
      mimetype: "image/webp",
      filename: basename(file),
      data: data.toString("base64"),
    })
  } catch (error) {
    return createResultError(
      op,
      "Unable to read local WebP file",
      error instanceof Error ? error.message : String(error),
    )
  }
}
