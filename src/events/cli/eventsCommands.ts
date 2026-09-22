import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import * as a from "valibot"
import { createResult, createResultError, type Result } from "#result"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigOrFail } from "../../cli/cliConfigOrFail.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { eventCancel } from "../eventCancel.js"
import { eventCreate } from "../eventCreate.js"
import { wahaWebSocketObserve } from "../wahaWebSocketObserve.js"
import { wahaWebSocketObserveMany } from "../wahaWebSocketObserveMany.js"

const DEFAULT_LIMIT = 10
const LIMIT_ERROR = "Limit must be a positive integer"
type EventsObservationFlags = CliConfigFlags & { timeoutMs?: number }

function eventsObservationConfig(flags: EventsObservationFlags) {
  const config = cliConfigOrFail(flags)
  return flags.timeoutMs === undefined ? config : { ...config, timeoutMs: flags.timeoutMs }
}

function eventsRequiredJsonFlag(brief: string) {
  return cliJsonFlagParam(brief, false) as { kind: "parsed"; parse: typeof String; brief: string }
}

function eventsObserveLimitParse(value: string | undefined): Result<number> {
  const op = "eventsObserve"
  if (value === undefined) return createResult(DEFAULT_LIMIT)
  if (!/^\d+$/.test(value)) return createResultError(op, LIMIT_ERROR)

  const limit = Number(value)
  if (!Number.isSafeInteger(limit) || limit < 1) return createResultError(op, LIMIT_ERROR)
  return createResult(limit)
}

const observeCommand = buildCommand({
  async func(this: CommandContext, flags: EventsObservationFlags & { limit?: string; events?: string[] }) {
    const limitResult = eventsObserveLimitParse(flags.limit)
    if (!limitResult.success) cliFail(limitResult)

    const config = eventsObservationConfig(flags)
    let delivered = 0
    const observation = wahaWebSocketObserveMany({
      config,
      payloadSchema: a.unknown(),
      events: flags.events,
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
        observation.close()
        cliFail(ready)
      }

      const completed = await observation.completed
      removeSignalListeners()
      if (!completed.success) {
        observation.close()
        cliFail(completed)
      }
    } finally {
      removeSignalListeners()
      observation.close()
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
      timeoutMs: cliScalarFlagParams.optionalNumber("Observation timeout in milliseconds"),
      events: cliScalarFlagParams.optionalStringList("WAHA event names to observe"),
    },
  },
  docs: { brief: "Observe events as compact JSON lines" },
})

const observeOneCommand = buildCommand({
  async func(this: CommandContext, flags: EventsObservationFlags & { events?: string[] }) {
    const config = eventsObservationConfig(flags)
    const observation = wahaWebSocketObserve({
      config,
      payloadSchema: a.unknown(),
      events: flags.events,
    })
    const onSignal = (): void => observation.close()
    const removeSignalListeners = (): void => {
      process.removeListener("SIGINT", onSignal)
      process.removeListener("SIGTERM", onSignal)
    }

    process.on("SIGINT", onSignal)
    process.on("SIGTERM", onSignal)
    try {
      const ready = await observation.ready
      if (!ready.success) {
        observation.close()
        cliFail(ready)
      }
      const event = await observation.event
      if (!event.success) {
        observation.close()
        cliFail(event)
      }
      this.process.stdout.write(`${JSON.stringify(event.data)}\n`)
    } finally {
      removeSignalListeners()
      observation.close()
    }
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      timeoutMs: cliScalarFlagParams.optionalNumber("Observation timeout in milliseconds"),
      events: cliScalarFlagParams.optionalStringList("WAHA event names to observe"),
    },
  },
  docs: { brief: "Observe the first matching event as a JSON line" },
})

const createCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { chatId: string; eventJson: string; reply_to?: string }) {
    const eventResult = cliJsonParse(flags.eventJson, "eventCreate", "eventJson")
    if (!eventResult.success) cliFail(eventResult)
    await cliRunApi(this, flags, (config) =>
      eventCreate({
        config,
        session: flags.session,
        chatId: flags.chatId,
        event: eventResult.data as {
          name: string
          description?: string
          startTime: number
          endTime?: number
          location?: { name: string }
          extraGuestsAllowed?: boolean
        },
        reply_to: flags.reply_to,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      chatId: cliScalarFlagParams.requiredString("Chat id"),
      eventJson: eventsRequiredJsonFlag("Event JSON"),
      reply_to: cliScalarFlagParams.optionalString("Message id to reply to"),
    },
  },
  docs: { brief: "Create a calendar event" },
})

const cancelCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => eventCancel({ config, session: flags.session, id: flags.id }))
  },
  parameters: { flags: { ...cliConfigFlagParams, id: cliScalarFlagParams.requiredString("Event message id") } },
  docs: { brief: "Cancel a calendar event" },
})

export const eventsCommands = buildRouteMap({
  routes: {
    observe: observeCommand,
    "observe-one": observeOneCommand,
    create: createCommand,
    cancel: cancelCommand,
  },
  docs: { brief: "Observe WAHA events" },
})
