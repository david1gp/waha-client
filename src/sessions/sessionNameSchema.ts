import * as a from "valibot"

export const sessionNameSchema = a.pipe(a.string(), a.minLength(1), a.maxLength(54), a.regex(/^[a-zA-Z0-9_-]*$/))
