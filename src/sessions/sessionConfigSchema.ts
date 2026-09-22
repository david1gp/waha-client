import * as a from "valibot"

/** Loose session config — WAHA accepts many nested engine fields. */
export const sessionConfigSchema = a.optional(a.record(a.string(), a.unknown()))
