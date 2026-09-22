import * as a from "valibot"
import { contactStructuredSchema } from "./contactStructuredSchema.js"
import { contactVcardSchema } from "./contactVcardSchema.js"

export const messageContactSchema = a.union([contactVcardSchema, contactStructuredSchema])
