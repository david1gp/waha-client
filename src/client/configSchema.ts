import * as a from "valibot"
import type { WahaClientConfig } from "./wahaClientConfigSchema.js"

export const configSchema = a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null)
