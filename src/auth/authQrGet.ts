import type { AuthQrGetOptions } from "./authQrGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { QrCodeFormat } from "./qrCodeFormat.js"
import type { QrCodeValue } from "./qrCodeValue.js"
import { authResolveSession } from "./authResolveSession.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"

const authQrGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  format: a.optional(a.picklist(["image", "raw"] as const)),
})

/** Live fetch · GET /api/{session}/auth/qr — fresh login QR code. */
export async function authQrGet(options: AuthQrGetOptions & { format: "raw" }): PromiseResult<QrCodeValue>
/** Live fetch · GET /api/{session}/auth/qr — fresh login QR code. */
export async function authQrGet(options: AuthQrGetOptions & { format?: "image" }): PromiseResult<Uint8Array>
/** Live fetch · GET /api/{session}/auth/qr — fresh login QR code. */
export async function authQrGet(options: AuthQrGetOptions): PromiseResult<Uint8Array | QrCodeValue> {
  const op = "authQrGet"
  const parsed = a.safeParse(authQrGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, format = "image" } = parsed.output
  const sessionR = authResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  if (format === "raw") {
    return wahaRequest<QrCodeValue>({
      config,
      method: "GET",
      path: wahaPathSession(sessionR.data, "/auth/qr"),
      query: { format: "raw" },
    })
  }

  return wahaRequest({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/auth/qr"),
    query: { format: "image" },
    responseType: "bytes",
  })
}
