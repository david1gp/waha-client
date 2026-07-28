import type { CommandContext } from "@stricli/core"
import type { PromiseResult, Result } from "#result"
import type { WahaClientConfig } from "../wahaClientConfig.js"
import { type CliConfigFlags, cliConfigLoad } from "./cliConfig.js"

export function cliWriteJson(ctx: CommandContext, data: unknown) {
  ctx.process.stdout.write(`${JSON.stringify(data, null, 2)}\n`)
}

export function cliFail(result: unknown): never {
  console.error(JSON.stringify(result))
  process.exit(1)
}

/** Load config, run API call, print JSON data or Result error + exit 1. */
export async function cliRunApi<T>(
  ctx: CommandContext,
  flags: CliConfigFlags,
  fn: (config: WahaClientConfig) => PromiseResult<T>,
  mapData?: (data: T) => unknown,
) {
  const configResult = cliConfigLoad(flags)
  if (!configResult.success) cliFail(configResult)
  const result = await fn(configResult.data)
  if (!result.success) cliFail(result)
  const data = mapData ? mapData(result.data) : result.data
  cliWriteJson(ctx, data)
}

export function cliConfigOrFail(flags: CliConfigFlags): WahaClientConfig {
  const configResult = cliConfigLoad(flags)
  if (!configResult.success) cliFail(configResult)
  return configResult.data
}

export function cliResultOrFail<T>(result: Result<T> | Awaited<PromiseResult<T>>): T {
  if (!result.success) cliFail(result)
  return result.data
}
