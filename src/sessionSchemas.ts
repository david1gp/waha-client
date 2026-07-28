import * as a from "valibot"
import { wahaClientConfigSchema } from "./wahaClientConfig.js"

export const sessionExpandSchema = a.picklist(["apps"])

/** Loose session config — WAHA accepts many nested engine fields. */
export const sessionConfigSchema = a.optional(a.record(a.string(), a.unknown()))

export const sessionNameSchema = a.pipe(a.string(), a.minLength(1), a.maxLength(54), a.regex(/^[a-zA-Z0-9_-]*$/))

export const sessionListOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  all: a.optional(a.boolean()),
  expand: a.optional(a.array(sessionExpandSchema)),
})

export const sessionCreateOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  name: a.optional(sessionNameSchema),
  sessionConfig: sessionConfigSchema,
  apps: a.optional(a.nullable(a.array(a.unknown()))),
  start: a.optional(a.boolean()),
})

export const sessionGetOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  session: a.optional(a.pipe(a.string(), a.minLength(1))),
  expand: a.optional(a.array(sessionExpandSchema)),
})

export const sessionUpdateOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  session: a.optional(a.pipe(a.string(), a.minLength(1))),
  sessionConfig: sessionConfigSchema,
  apps: a.optional(a.nullable(a.array(a.unknown()))),
})

export const sessionPathOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  session: a.optional(a.pipe(a.string(), a.minLength(1))),
})

export const sessionsStartOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  name: a.optional(a.pipe(a.string(), a.minLength(1))),
  sessionConfig: sessionConfigSchema,
})

export const sessionsStopOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  name: a.optional(a.pipe(a.string(), a.minLength(1))),
  logout: a.optional(a.boolean()),
})

export const sessionsLogoutOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  name: a.optional(a.pipe(a.string(), a.minLength(1))),
})

export type SessionListOptions = a.InferInput<typeof sessionListOptionsSchema>
export type SessionCreateOptions = a.InferInput<typeof sessionCreateOptionsSchema>
export type SessionGetOptions = a.InferInput<typeof sessionGetOptionsSchema>
export type SessionUpdateOptions = a.InferInput<typeof sessionUpdateOptionsSchema>
export type SessionPathOptions = a.InferInput<typeof sessionPathOptionsSchema>
export type SessionsStartOptions = a.InferInput<typeof sessionsStartOptionsSchema>
export type SessionsStopOptions = a.InferInput<typeof sessionsStopOptionsSchema>
export type SessionsLogoutOptions = a.InferInput<typeof sessionsLogoutOptionsSchema>

/** Resolve path/body session name from explicit value or config.session. */
export function sessionResolveName(session: string | undefined, configSession: string | undefined): string | undefined {
  const s = session ?? configSession
  if (s == null || s === "") return undefined
  return s
}
