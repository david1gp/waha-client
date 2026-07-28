import { createResult, createResultError, type PromiseResult, resultTryParsingFetchErr } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"

export type WahaRequestOptions = {
  config: WahaClientConfig
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  query?: Record<string, string | number | boolean | readonly string[] | undefined | null>
  body?: unknown
  /** If true, inject config.session into body.session when body is object and session missing */
  injectSession?: boolean
  /** "json" (default) | "bytes" | "text" | "void" */
  responseType?: "json" | "bytes" | "text" | "void"
  headers?: Record<string, string>
}

const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_RETRIES = 0

/** Inject default session into a plain object body when missing. */
export function wahaRequestBodyWithSession(
  body: unknown,
  session: string | undefined,
  injectSession: boolean | undefined,
): unknown {
  if (!injectSession || session == null || session === "") return body
  if (body === null || typeof body !== "object" || Array.isArray(body)) return body
  const obj = body as Record<string, unknown>
  if (obj.session !== undefined && obj.session !== null) return body
  return { ...obj, session }
}

/** Build `?k=v` query string; skips null/undefined values. */
export function wahaRequestQueryString(
  query?: Record<string, string | number | boolean | readonly string[] | undefined | null>,
): string {
  if (!query) return ""
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, String(item))
      continue
    }
    params.append(key, String(value))
  }
  const s = params.toString()
  return s ? `?${s}` : ""
}

export function wahaRequestUrl(baseUrl: string, path: string, query?: WahaRequestOptions["query"]): string {
  return `${baseUrl}${path}${wahaRequestQueryString(query)}`
}

export async function wahaRequest(options: WahaRequestOptions & { responseType: "void" }): PromiseResult<undefined>
export async function wahaRequest(options: WahaRequestOptions & { responseType: "text" }): PromiseResult<string>
export async function wahaRequest(options: WahaRequestOptions & { responseType: "bytes" }): PromiseResult<Uint8Array>
export async function wahaRequest<T = unknown>(
  options: WahaRequestOptions & { responseType?: "json" },
): PromiseResult<T>
export async function wahaRequest(options: WahaRequestOptions): PromiseResult<unknown> {
  const op = "wahaRequest"
  const { config, method, path, query, headers: extraHeaders, injectSession } = options
  const responseType = options.responseType ?? "json"
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const retries = config.retries ?? DEFAULT_RETRIES
  const maxAttempts = retries + 1

  const body = wahaRequestBodyWithSession(options.body, config.session, injectSession)
  const url = wahaRequestUrl(config.baseUrl, path, query)

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...extraHeaders,
  }
  if (config.apiKey) headers["X-Api-Key"] = config.apiKey

  let bodyInit: string | undefined
  if (body !== undefined) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json"
    bodyInit = JSON.stringify(body)
  }

  let lastError: ReturnType<typeof createResultError> | undefined

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    try {
      let response: Response
      try {
        response = await fetch(url, {
          method,
          headers,
          body: bodyInit,
          signal: controller.signal,
        })
      } catch (error) {
        lastError = createResultError(op, "Fetch failed", error instanceof Error ? error.message : String(error))
        if (attempt < maxAttempts - 1) continue
        return lastError
      }

      if (!response.ok) {
        let text: string
        try {
          text = await response.text()
        } catch (error) {
          lastError = createResultError(
            op,
            "Reading response failed",
            error instanceof Error ? error.message : String(error),
          )
          if (response.status >= 500 && attempt < maxAttempts - 1) continue
          return lastError
        }
        const err = resultTryParsingFetchErr(op, text, response.status, response.statusText)
        if (response.status >= 500 && attempt < maxAttempts - 1) {
          lastError = err
          continue
        }
        return err
      }

      if (responseType === "void" || response.status === 204) {
        return createResult(undefined)
      }

      if (responseType === "bytes") {
        try {
          const buf = await response.arrayBuffer()
          return createResult(new Uint8Array(buf))
        } catch (error) {
          return createResultError(
            op,
            "Reading binary response failed",
            error instanceof Error ? error.message : String(error),
          )
        }
      }

      let text: string
      try {
        text = await response.text()
      } catch (error) {
        return createResultError(op, "Reading response failed", error instanceof Error ? error.message : String(error))
      }

      if (responseType === "text") {
        return createResult(text)
      }

      // json
      if (text === "") return createResult(undefined)
      try {
        return createResult(JSON.parse(text) as unknown)
      } catch (error) {
        return createResultError(op, "Invalid JSON response", error instanceof Error ? error.message : text)
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  return lastError ?? createResultError(op, "Request failed after retries")
}
