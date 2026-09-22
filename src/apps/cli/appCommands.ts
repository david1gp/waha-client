import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import type { App } from "../app.js"
import { appChatwootLocalesGet } from "../appChatwootLocalesGet.js"
import { appCreate } from "../appCreate.js"
import { appDelete } from "../appDelete.js"
import { appGet } from "../appGet.js"
import { appList } from "../appList.js"
import { appUpdate } from "../appUpdate.js"

const sessionlessConfigFlagParams = {
  baseUrl: cliConfigFlagParams.baseUrl,
  apiKey: cliConfigFlagParams.apiKey,
}
type SessionlessFlags = { baseUrl?: string; apiKey?: string }

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => appList({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List apps" },
})

const createCommand = buildCommand({
  async func(this: CommandContext, flags: SessionlessFlags & { bodyJson: string }) {
    const body = cliJsonParse(flags.bodyJson, "appCreate", "bodyJson")
    if (!body.success) cliFail(body)

    await cliRunApi(this, flags, (config) => appCreate({ config, body: body.data as App }))
  },
  parameters: {
    flags: {
      ...sessionlessConfigFlagParams,
      bodyJson: cliJsonFlagParam("App request body as JSON", false) as {
        kind: "parsed"
        parse: typeof String
        brief: string
      },
    },
  },
  docs: { brief: "Create an app" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: SessionlessFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => appGet({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...sessionlessConfigFlagParams,
      id: cliScalarFlagParams.requiredString("App id"),
    },
  },
  docs: { brief: "Get an app" },
})

const updateCommand = buildCommand({
  async func(this: CommandContext, flags: SessionlessFlags & { id: string; bodyJson: string }) {
    const body = cliJsonParse(flags.bodyJson, "appUpdate", "bodyJson")
    if (!body.success) cliFail(body)

    await cliRunApi(this, flags, (config) => appUpdate({ config, id: flags.id, body: body.data as App }))
  },
  parameters: {
    flags: {
      ...sessionlessConfigFlagParams,
      id: cliScalarFlagParams.requiredString("App id"),
      bodyJson: cliJsonFlagParam("App request body as JSON", false) as {
        kind: "parsed"
        parse: typeof String
        brief: string
      },
    },
  },
  docs: { brief: "Update an app" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: SessionlessFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => appDelete({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...sessionlessConfigFlagParams,
      id: cliScalarFlagParams.requiredString("App id"),
    },
  },
  docs: { brief: "Delete an app" },
})

const chatwootLocalesCommand = buildCommand({
  async func(this: CommandContext, flags: SessionlessFlags) {
    await cliRunApi(this, flags, (config) => appChatwootLocalesGet({ config }))
  },
  parameters: { flags: { ...sessionlessConfigFlagParams } },
  docs: { brief: "List Chatwoot locales" },
})

export const appCommands = buildRouteMap({
  routes: {
    list: listCommand,
    create: createCommand,
    get: getCommand,
    update: updateCommand,
    delete: deleteCommand,
    "chatwoot-locales": chatwootLocalesCommand,
  },
  docs: { brief: "App operations" },
})
