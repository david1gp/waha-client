import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import * as a from "valibot"
import { createResult, createResultError, type Result } from "#result"
import { wahaWebSocketObserveMany } from "../../wahaWebSocketObserveMany.js"
import { type CliConfigFlags, cliConfigFlagParams } from "../cliConfig.js"
import { cliConfigOrFail, cliFail } from "../cliRun.js"

const DEFAULT_LIMIT = 10
const LIMIT_ERROR = "Limit must be a positive integer"

function eventsObserveLimitParse(value: string | undefined): Result<number> {
  const op = "eventsObserve"
  if (value === undefined) return createResult(DEFAULT_LIMIT)
  if (!/^\d+$/.test(value)) return createResultError(op, LIMIT_ERROR)

  const limit = Number(value)
  if (!Number.isSafeInteger(limit) || limit < 1) return createResultError(op, LIMIT_ERROR)
  return createResult(limit)
}

const observeCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { limit?: string }) {
    const limitResult = eventsObserveLimitParse(flags.limit)
    if (!limitResult.success) cliFail(limitResult)

    const config = cliConfigOrFail(flags)
    let delivered = 0
    const observation = wahaWebSocketObserveMany({
      config,
      payloadSchema: a.unknown(),
      onEvent: (event) => {
        this.process.stdout.write(`${JSON.stringify(event)}\n`)
        delivered += 1
        return delivered >= limitResult.data ? "complete" : "continue"
      },
    })

    const onSignal = (): void => {
      observation.close()
    }
    const removeSignalListeners = (): void => {
      process.removeListener("SIGINT", onSignal)
      process.removeListener("SIGTERM", onSignal)
    }

    process.on("SIGINT", onSignal)
    process.on("SIGTERM", onSignal)

    try {
      const ready = await observation.ready
      if (!ready.success) {
        removeSignalListeners()
        cliFail(ready)
      }

      const completed = await observation.completed
      removeSignalListeners()
      if (!completed.success) cliFail(completed)
    } finally {
      removeSignalListeners()
    }
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      limit: {
        kind: "parsed",
        parse: String,
        optional: true,
        brief: "Number of events to observe (default: 10)",
      },
    },
  },
  docs: { brief: "Observe events as compact JSON lines" },
})

export const eventsCommands = buildRouteMap({
  routes: { observe: observeCommand },
  docs: { brief: "Observe WAHA events" },
})
