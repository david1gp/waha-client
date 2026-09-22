import * as a from "valibot"

export const chatIdSchema = a.pipe(a.string(), a.minLength(1))
