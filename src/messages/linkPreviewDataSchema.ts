import * as a from "valibot"
import { wahaFileSchema } from "../media/wahaFileSchema.js"

export const linkPreviewDataSchema = a.object({
  url: a.string(),
  title: a.string(),
  description: a.string(),
  image: a.optional(wahaFileSchema),
})
