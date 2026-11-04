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
import { appPurge } from "../appPurge.js"
import { appSessionPurge } from "../appSessionPurge.js"
import { appUpdate } from "../appUpdate.js"
import { phoneNumbersCacheDbGet } from "../phoneNumbersCacheDbGet.js"
import { phoneNumbersCacheMemoryGet } from "../phoneNumbersCacheMemoryGet.js"
import { phoneNumbersCachePurge } from "../phoneNumbersCachePurge.js"
import { phoneNumbersCacheStatsGet } from "../phoneNumbersCacheStatsGet.js"
import type { PhoneNumbersAppName } from "../phoneNumbersAppName.js"

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

const purgeCommand = buildCommand({
  async func(this: CommandContext, flags: SessionlessFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => appPurge({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...sessionlessConfigFlagParams,
      id: cliScalarFlagParams.requiredString("App id"),
    },
  },
  docs: { brief: "Purge an app's stored data" },
})

const sessionPurgeCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { app: string }) {
    await cliRunApi(this, flags, (config) => appSessionPurge({ config, app: flags.app, session: flags.session }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      app: cliScalarFlagParams.requiredString("App name"),
    },
  },
  docs: { brief: "Purge a unique app's stored data for a session" },
})

const phoneCacheDbCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { app?: string; limit?: number; offset?: number }) {
    await cliRunApi(this, flags, (config) =>
      phoneNumbersCacheDbGet({
        config,
        session: flags.session,
        app: flags.app as PhoneNumbersAppName | undefined,
        limit: flags.limit,
        offset: flags.offset,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      app: cliScalarFlagParams.optionalString("Phone numbers app (default phone-numbers)"),
      limit: cliScalarFlagParams.optionalNumber("Max cache entries to return"),
      offset: cliScalarFlagParams.optionalNumber("Offset for pagination"),
    },
  },
  docs: { brief: "List phone numbers persistent cache entries" },
})

const phoneCacheMemoryCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { app?: string; limit?: number; offset?: number }) {
    await cliRunApi(this, flags, (config) =>
      phoneNumbersCacheMemoryGet({
        config,
        session: flags.session,
        app: flags.app as PhoneNumbersAppName | undefined,
        limit: flags.limit,
        offset: flags.offset,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      app: cliScalarFlagParams.optionalString("Phone numbers app (default phone-numbers)"),
      limit: cliScalarFlagParams.optionalNumber("Max cache entries to return"),
      offset: cliScalarFlagParams.optionalNumber("Offset for pagination"),
    },
  },
  docs: { brief: "List phone numbers in-memory cache entries" },
})

const phoneCacheStatsCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { app?: string }) {
    await cliRunApi(this, flags, (config) =>
      phoneNumbersCacheStatsGet({
        config,
        session: flags.session,
        app: flags.app as PhoneNumbersAppName | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      app: cliScalarFlagParams.optionalString("Phone numbers app (default phone-numbers)"),
    },
  },
  docs: { brief: "Get phone numbers cache stats" },
})

const phoneCachePurgeCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { app?: string }) {
    await cliRunApi(this, flags, (config) =>
      phoneNumbersCachePurge({
        config,
        session: flags.session,
        app: flags.app as PhoneNumbersAppName | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      app: cliScalarFlagParams.optionalString("Phone numbers app (default phone-numbers)"),
    },
  },
  docs: { brief: "Purge the phone numbers resolved-numbers cache" },
})

export const appCommands = buildRouteMap({
  routes: {
    list: listCommand,
    create: createCommand,
    get: getCommand,
    update: updateCommand,
    delete: deleteCommand,
    purge: purgeCommand,
    "session-purge": sessionPurgeCommand,
    "chatwoot-locales": chatwootLocalesCommand,
    "phone-cache-db": phoneCacheDbCommand,
    "phone-cache-memory": phoneCacheMemoryCommand,
    "phone-cache-stats": phoneCacheStatsCommand,
    "phone-cache-purge": phoneCachePurgeCommand,
  },
  docs: { brief: "App operations" },
})
