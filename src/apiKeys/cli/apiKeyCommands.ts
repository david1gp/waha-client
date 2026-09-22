import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { apiKeyControlCreate } from "../apiKeyControlCreate.js"
import { apiKeyCreate } from "../apiKeyCreate.js"
import { apiKeyDelete } from "../apiKeyDelete.js"
import { apiKeyList } from "../apiKeyList.js"
import { apiKeyMediaCreate } from "../apiKeyMediaCreate.js"
import type { ApiKeyRequest } from "../apiKeyRequest.js"
import { apiKeyUpdate } from "../apiKeyUpdate.js"

const sessionlessConfigFlagParams = {
  baseUrl: cliConfigFlagParams.baseUrl,
  apiKey: cliConfigFlagParams.apiKey,
}
type SessionlessFlags = { baseUrl?: string; apiKey?: string }

const createCommand = buildCommand({
  async func(this: CommandContext, flags: SessionlessFlags & { bodyJson?: string }) {
    const body = cliJsonParse(flags.bodyJson, "apiKeyCreate", "bodyJson")
    if (!body.success) cliFail(body)

    await cliRunApi(this, flags, (config) =>
      apiKeyCreate({
        config,
        body: body.data as ApiKeyRequest | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...sessionlessConfigFlagParams,
      bodyJson: cliJsonFlagParam("API key request body as JSON") as {
        kind: "parsed"
        parse: typeof String
        optional: true
        brief: string
      },
    },
  },
  docs: { brief: "Create an API key" },
})

const listCommand = buildCommand({
  async func(this: CommandContext, flags: SessionlessFlags) {
    await cliRunApi(this, flags, (config) => apiKeyList({ config }))
  },
  parameters: { flags: { ...sessionlessConfigFlagParams } },
  docs: { brief: "List API keys" },
})

const mediaCreateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => apiKeyMediaCreate({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Create a media API key" },
})

const controlCreateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => apiKeyControlCreate({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Create a control API key" },
})

const updateCommand = buildCommand({
  async func(this: CommandContext, flags: SessionlessFlags & { id: string; bodyJson?: string }) {
    const body = cliJsonParse(flags.bodyJson, "apiKeyUpdate", "bodyJson")
    if (!body.success) cliFail(body)

    await cliRunApi(this, flags, (config) =>
      apiKeyUpdate({
        config,
        id: flags.id,
        body: body.data as ApiKeyRequest | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...sessionlessConfigFlagParams,
      id: cliScalarFlagParams.requiredString("API key id"),
      bodyJson: cliJsonFlagParam("API key request body as JSON") as {
        kind: "parsed"
        parse: typeof String
        optional: true
        brief: string
      },
    },
  },
  docs: { brief: "Update an API key" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: SessionlessFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => apiKeyDelete({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...sessionlessConfigFlagParams,
      id: cliScalarFlagParams.requiredString("API key id"),
    },
  },
  docs: { brief: "Delete an API key" },
})

export const apiKeyCommands = buildRouteMap({
  routes: {
    create: createCommand,
    list: listCommand,
    "media-create": mediaCreateCommand,
    "control-create": controlCreateCommand,
    update: updateCommand,
    delete: deleteCommand,
  },
  docs: { brief: "API key operations" },
})
