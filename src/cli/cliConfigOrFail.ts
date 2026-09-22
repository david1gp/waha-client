import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import type { CliConfigFlags } from "./cliConfigFlags.js"
import { cliConfigLoad } from "./cliConfigLoad.js"
import { cliFail } from "./cliFail.js"

export function cliConfigOrFail(flags: CliConfigFlags): WahaClientConfig {
  const configResult = cliConfigLoad(flags)
  if (!configResult.success) cliFail(configResult)
  return configResult.data
}
