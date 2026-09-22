import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import * as a from "valibot"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { sessionCappingGet } from "../sessionCappingGet.js"
import type { SessionConfig } from "../sessionConfig.js"
import { sessionCreate } from "../sessionCreate.js"
import { sessionDelete } from "../sessionDelete.js"
import type { SessionExpand } from "../sessionExpand.js"
import { sessionExpandSchema } from "../sessionExpandSchema.js"
import { sessionGet } from "../sessionGet.js"
import { sessionList } from "../sessionList.js"
import { sessionLogout } from "../sessionLogout.js"
import { sessionMe } from "../sessionMe.js"
import { sessionRestart } from "../sessionRestart.js"
import { sessionStart } from "../sessionStart.js"
import { sessionStop } from "../sessionStop.js"
import { sessionsLogout } from "../sessionsLogout.js"
import { sessionsStart } from "../sessionsStart.js"
import { sessionsStop } from "../sessionsStop.js"
import { sessionTimelockGet } from "../sessionTimelockGet.js"
import { sessionUpdate } from "../sessionUpdate.js"

type SessionNameFlags = CliConfigFlags
type SessionlessFlags = { baseUrl?: string; apiKey?: string }

const sessionlessConfigFlagParams = {
  baseUrl: cliConfigFlagParams.baseUrl,
  apiKey: cliConfigFlagParams.apiKey,
}

function sessionExpandParse(values: string[] | undefined): SessionExpand[] | undefined {
  if (values === undefined) return undefined

  const parsedValues: SessionExpand[] = []
  for (const value of values) {
    const parsed = a.safeParse(sessionExpandSchema, value)
    if (!parsed.success) cliFail({ success: false, op: "sessionExpand", errorMessage: 'Expand must be "apps"' })
    parsedValues.push(parsed.output)
  }
  return parsedValues
}

function sessionRequiredJsonFlag(brief: string) {
  return cliJsonFlagParam(brief, false) as { kind: "parsed"; parse: typeof String; brief: string }
}

function sessionOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

const listCommand = buildCommand({
  async func(this: CommandContext, flags: SessionlessFlags & { all?: boolean; expand?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      sessionList({ config, all: flags.all, expand: sessionExpandParse(flags.expand) }),
    )
  },
  parameters: {
    flags: {
      ...sessionlessConfigFlagParams,
      all: {
        kind: "boolean",
        optional: true,
        brief: "Include stopped sessions",
      },
      expand: cliScalarFlagParams.optionalStringList("Session fields to expand"),
    },
  },
  docs: { brief: "List sessions" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: SessionNameFlags & { expand?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      sessionGet({ config, session: flags.session, expand: sessionExpandParse(flags.expand) }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      expand: cliScalarFlagParams.optionalStringList("Session fields to expand"),
    },
  },
  docs: { brief: "Get session by name (or WAHA_SESSION)" },
})

const createCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: SessionlessFlags & { name?: string; sessionConfigJson: string; appsJson?: string; start?: boolean },
  ) {
    const sessionConfigResult = cliJsonParse(flags.sessionConfigJson, "sessionCreate", "sessionConfigJson")
    if (!sessionConfigResult.success) cliFail(sessionConfigResult)
    const appsResult = cliJsonParse(flags.appsJson, "sessionCreate", "appsJson")
    if (!appsResult.success) cliFail(appsResult)
    await cliRunApi(this, flags, (config) =>
      sessionCreate({
        config,
        name: flags.name,
        sessionConfig: sessionConfigResult.data as SessionConfig,
        apps: appsResult.data as null | unknown[] | undefined,
        start: flags.start,
      }),
    )
  },
  parameters: {
    flags: {
      ...sessionlessConfigFlagParams,
      name: {
        kind: "parsed",
        parse: String,
        optional: true,
        brief: "Session name",
      },
      sessionConfigJson: sessionRequiredJsonFlag("Session configuration JSON"),
      appsJson: sessionOptionalJsonFlag("Session apps JSON"),
      start: {
        kind: "boolean",
        optional: true,
        brief: "Start session after create",
      },
    },
  },
  docs: { brief: "Create a session" },
})

const updateCommand = buildCommand({
  async func(this: CommandContext, flags: SessionNameFlags & { sessionConfigJson: string; appsJson?: string }) {
    const sessionConfigResult = cliJsonParse(flags.sessionConfigJson, "sessionUpdate", "sessionConfigJson")
    if (!sessionConfigResult.success) cliFail(sessionConfigResult)
    const appsResult = cliJsonParse(flags.appsJson, "sessionUpdate", "appsJson")
    if (!appsResult.success) cliFail(appsResult)
    await cliRunApi(this, flags, (config) =>
      sessionUpdate({
        config,
        session: flags.session,
        sessionConfig: sessionConfigResult.data as SessionConfig,
        apps: appsResult.data as null | unknown[] | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      sessionConfigJson: sessionRequiredJsonFlag("Session configuration JSON"),
      appsJson: sessionOptionalJsonFlag("Session apps JSON"),
    },
  },
  docs: { brief: "Update a session" },
})

const startAllCommand = buildCommand({
  async func(this: CommandContext, flags: SessionlessFlags & { name?: string; sessionConfigJson: string }) {
    const sessionConfigResult = cliJsonParse(flags.sessionConfigJson, "sessionsStart", "sessionConfigJson")
    if (!sessionConfigResult.success) cliFail(sessionConfigResult)
    await cliRunApi(this, flags, (config) =>
      sessionsStart({ config, name: flags.name, sessionConfig: sessionConfigResult.data as SessionConfig }),
    )
  },
  parameters: {
    flags: {
      ...sessionlessConfigFlagParams,
      name: cliScalarFlagParams.optionalString("Session name"),
      sessionConfigJson: sessionRequiredJsonFlag("Session configuration JSON"),
    },
  },
  docs: { brief: "Start a session through the legacy bulk endpoint" },
})

const stopAllCommand = buildCommand({
  async func(this: CommandContext, flags: SessionlessFlags & { name?: string; logout?: boolean }) {
    await cliRunApi(this, flags, (config) => sessionsStop({ config, name: flags.name, logout: flags.logout }))
  },
  parameters: {
    flags: {
      ...sessionlessConfigFlagParams,
      name: cliScalarFlagParams.optionalString("Session name"),
      logout: cliScalarFlagParams.optionalBoolean("Logout while stopping"),
    },
  },
  docs: { brief: "Stop a session through the legacy bulk endpoint" },
})

const logoutAllCommand = buildCommand({
  async func(this: CommandContext, flags: SessionlessFlags & { name?: string }) {
    await cliRunApi(this, flags, (config) => sessionsLogout({ config, name: flags.name }))
  },
  parameters: {
    flags: {
      ...sessionlessConfigFlagParams,
      name: cliScalarFlagParams.optionalString("Session name"),
    },
  },
  docs: { brief: "Logout a session through the legacy bulk endpoint" },
})

const startCommand = buildCommand({
  async func(this: CommandContext, flags: SessionNameFlags) {
    await cliRunApi(this, flags, (config) => sessionStart({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Start a session" },
})

const stopCommand = buildCommand({
  async func(this: CommandContext, flags: SessionNameFlags) {
    await cliRunApi(this, flags, (config) => sessionStop({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Stop a session" },
})

const logoutCommand = buildCommand({
  async func(this: CommandContext, flags: SessionNameFlags) {
    await cliRunApi(this, flags, (config) => sessionLogout({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Logout a session" },
})

const restartCommand = buildCommand({
  async func(this: CommandContext, flags: SessionNameFlags) {
    await cliRunApi(this, flags, (config) => sessionRestart({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Restart a session" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: SessionNameFlags) {
    await cliRunApi(this, flags, (config) => sessionDelete({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Delete a session" },
})

const meCommand = buildCommand({
  async func(this: CommandContext, flags: SessionNameFlags) {
    await cliRunApi(this, flags, (config) => sessionMe({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Get authenticated account (me) for a session" },
})

const cappingCommand = buildCommand({
  async func(this: CommandContext, flags: SessionNameFlags) {
    await cliRunApi(this, flags, (config) => sessionCappingGet({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Get session capping status" },
})

const timelockCommand = buildCommand({
  async func(this: CommandContext, flags: SessionNameFlags) {
    await cliRunApi(this, flags, (config) => sessionTimelockGet({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Get session timelock status" },
})

export const sessionCommands = buildRouteMap({
  routes: {
    list: listCommand,
    get: getCommand,
    create: createCommand,
    update: updateCommand,
    start: startCommand,
    stop: stopCommand,
    logout: logoutCommand,
    restart: restartCommand,
    delete: deleteCommand,
    me: meCommand,
    capping: cappingCommand,
    timelock: timelockCommand,
    "start-all": startAllCommand,
    "stop-all": stopAllCommand,
    "logout-all": logoutAllCommand,
  },
  docs: { brief: "Manage WAHA sessions" },
})
