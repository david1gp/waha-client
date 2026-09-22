import * as a from "valibot"

export const buttonTypeSchema = a.picklist(["reply", "url", "call", "copy"])
