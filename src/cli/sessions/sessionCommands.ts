import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { sessionCreate } from "../../sessionCreate.js"
import { sessionDelete } from "../../sessionDelete.js"
import { sessionGet } from "../../sessionGet.js"
import { sessionList } from "../../sessionList.js"
import { sessionLogout } from "../../sessionLogout.js"
import { sessionMe } from "../../sessionMe.js"
import { sessionRestart } from "../../sessionRestart.js"
import { sessionStart } from "../../sessionStart.js"
import { sessionStop } from "../../sessionStop.js"
import { type CliConfigFlags, cliConfigFlagParams } from "../cliConfig.js"
import { cliRunApi } from "../cliRun.js"

type SessionNameFlags = CliConfigFlags

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { all?: boolean }) {
    await cliRunApi(this, flags, (config) => sessionList({ config, all: flags.all }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      all: {
        kind: "boolean",
        optional: true,
        brief: "Include stopped sessions",
      },
    },
  },
  docs: { brief: "List sessions" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: SessionNameFlags) {
    await cliRunApi(this, flags, (config) => sessionGet({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Get session by name (or WAHA_SESSION)" },
})

const createCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { name?: string; start?: boolean }) {
    await cliRunApi(this, flags, (config) =>
      sessionCreate({
        config,
        name: flags.name,
        start: flags.start,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      name: {
        kind: "parsed",
        parse: String,
        optional: true,
        brief: "Session name",
      },
      start: {
        kind: "boolean",
        optional: true,
        brief: "Start session after create",
      },
    },
  },
  docs: { brief: "Create a session" },
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

export const sessionCommands = buildRouteMap({
  routes: {
    list: listCommand,
    get: getCommand,
    create: createCommand,
    start: startCommand,
    stop: stopCommand,
    logout: logoutCommand,
    restart: restartCommand,
    delete: deleteCommand,
    me: meCommand,
  },
  docs: { brief: "Manage WAHA sessions" },
})
