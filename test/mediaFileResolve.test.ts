import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { groupPictureFileResolve } from "../src/groups/cli/groupPictureFileResolve.js"
import { messageFileResolve } from "../src/messages/cli/messageFileResolve.js"
import { messageStickerFileResolve } from "../src/messages/cli/messageStickerFileResolve.js"
import { profilePictureFileResolve } from "../src/profile/cli/profilePictureFileResolve.js"
import { statusFileResolve } from "../src/status/cli/statusFileResolve.js"

describe("CLI media file resolution", () => {
  let directory = ""

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "waha-client-media-"))
    await writeFile(join(directory, "picture.PNG"), Buffer.from("picture"))
    await writeFile(join(directory, "audio.mp3"), Buffer.from("audio"))
    await writeFile(join(directory, "unknown.bin"), Buffer.from("unknown"))
    await writeFile(join(directory, "sticker.txt"), Buffer.from("sticker"))
  })

  afterAll(async () => {
    await rm(directory, { force: true, recursive: true })
  })

  test("reads local files with the filename, base64 data, and policy MIME", async () => {
    const group = await groupPictureFileResolve(join(directory, "picture.PNG"))
    expect(group).toEqual({
      success: true,
      data: { mimetype: "image/png", filename: "picture.PNG", data: Buffer.from("picture").toString("base64") },
    })

    const message = await messageFileResolve(join(directory, "picture.PNG"), "application/octet-stream")
    expect(message).toEqual({
      success: true,
      data: {
        mimetype: "application/octet-stream",
        filename: "picture.PNG",
        data: Buffer.from("picture").toString("base64"),
      },
    })

    const status = await statusFileResolve(join(directory, "audio.mp3"), "audio/ogg")
    expect(status).toEqual({
      success: true,
      data: { mimetype: "audio/mpeg", filename: "audio.mp3", data: Buffer.from("audio").toString("base64") },
    })
  })

  test("preserves remote URLs and resolves MIME from URL paths before query strings", async () => {
    const profile = await profilePictureFileResolve("https://example.test/avatar.png?token=abc#current")
    expect(profile).toEqual({
      success: true,
      data: { mimetype: "image/png", url: "https://example.test/avatar.png?token=abc#current" },
    })

    const status = await statusFileResolve("https://example.test/clip.mp4?token=abc", "video/webm")
    expect(status).toEqual({
      success: true,
      data: { mimetype: "video/mp4", url: "https://example.test/clip.mp4?token=abc" },
    })

    const message = await messageFileResolve("https://example.test/file.bin?token=abc", "application/octet-stream")
    expect(message).toEqual({
      success: true,
      data: { mimetype: "application/octet-stream", url: "https://example.test/file.bin?token=abc" },
    })

    const group = await groupPictureFileResolve("https://example.test/avatar.png?token=abc")
    expect(group).toEqual({
      success: true,
      data: { mimetype: "image/jpeg", url: "https://example.test/avatar.png?token=abc" },
    })
  })

  test("keeps fallback MIME behavior for unknown extensions", async () => {
    const group = await groupPictureFileResolve(join(directory, "unknown.bin"))
    expect(group.success && group.data.mimetype).toBe("image/jpeg")

    const status = await statusFileResolve("https://example.test/download?token=abc", "audio/ogg")
    expect(status.success && status.data.mimetype).toBe("audio/ogg")
  })

  test("keeps sticker MIME restrictions without adding extension validation", async () => {
    const sticker = await messageStickerFileResolve(join(directory, "sticker.txt"))
    expect(sticker).toEqual({
      success: true,
      data: { mimetype: "image/webp", filename: "sticker.txt", data: Buffer.from("sticker").toString("base64") },
    })

    const remoteSticker = await messageStickerFileResolve("https://example.test/sticker.png?token=abc")
    expect(remoteSticker).toEqual({
      success: true,
      data: { mimetype: "image/webp", url: "https://example.test/sticker.png?token=abc" },
    })
  })

  test("returns each resolver's existing error operation and message for missing files", async () => {
    const missing = join(directory, "missing.file")
    const results = [
      [await groupPictureFileResolve(missing), "groupPictureFileResolve", "Unable to read local group picture"],
      [
        await messageFileResolve(missing, "application/octet-stream"),
        "messageFileResolve",
        "Unable to read local message file",
      ],
      [await messageStickerFileResolve(missing), "messageStickerFileResolve", "Unable to read local WebP file"],
      [await statusFileResolve(missing, "image/jpeg"), "statusFileResolve", "Unable to read local status file"],
      [await profilePictureFileResolve(missing), "profilePictureFileResolve", "Unable to read profile picture file"],
    ] as const

    for (const [result, operation, message] of results) {
      expect(result.success).toBe(false)
      if (result.success) continue
      expect(result.op).toBe(operation)
      expect(result.errorMessage).toContain(message)
    }
  })
})
