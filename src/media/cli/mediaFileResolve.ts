import { readFile } from "node:fs/promises"
import { basename, extname } from "node:path"
import { createResult, createResultError, type Result } from "#result"
import type { WahaFile } from "../wahaFile.js"

const HTTP_URL_PATTERN = /^https?:\/\//i
const IMAGE_MIME_TYPES: Readonly<Record<string, string>> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
}

type MediaFileResolveOptions = {
  fallbackMimetype: string
  operation: string
  localError: string
  extraMimeTypes?: Readonly<Record<string, string>>
  inferMimetype?: boolean
  inferRemoteMimetype?: boolean
}

function mediaFileIsRemote(file: string): boolean {
  return HTTP_URL_PATTERN.test(file)
}

function mediaFileExtension(file: string, remote: boolean): string {
  const path = remote ? (file.split(/[?#]/, 1)[0] ?? file) : file
  return extname(path).toLowerCase()
}

function mediaFileMimetype(file: string, options: MediaFileResolveOptions, remote: boolean): string {
  const shouldInfer = options.inferMimetype !== false && (!remote || options.inferRemoteMimetype !== false)
  if (!shouldInfer) return options.fallbackMimetype

  const extension = mediaFileExtension(file, remote)
  return options.extraMimeTypes?.[extension] ?? IMAGE_MIME_TYPES[extension] ?? options.fallbackMimetype
}

export async function mediaFileResolve(file: string, options: MediaFileResolveOptions): Promise<Result<WahaFile>> {
  const remote = mediaFileIsRemote(file)
  const mimetype = mediaFileMimetype(file, options, remote)
  if (remote) return createResult({ mimetype, url: file })

  try {
    const data = await readFile(file)
    return createResult({ mimetype, filename: basename(file), data: data.toString("base64") })
  } catch (error) {
    return createResultError(
      options.operation,
      options.localError,
      error instanceof Error ? error.message : String(error),
    )
  }
}
