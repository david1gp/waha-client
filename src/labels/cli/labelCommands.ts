import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { labelChatList } from "../labelChatList.js"
import { labelChatSet } from "../labelChatSet.js"
import { labelChatsByLabelGet } from "../labelChatsByLabelGet.js"
import { labelCreate } from "../labelCreate.js"
import { labelDelete } from "../labelDelete.js"
import { labelList } from "../labelList.js"
import { labelUpdate } from "../labelUpdate.js"
import type { LabelID } from "../labelID.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => labelList({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List labels" },
})

const createCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { name: string; colorHex?: string; color?: number }) {
    await cliRunApi(this, flags, (config) =>
      labelCreate({
        config,
        session: flags.session,
        name: flags.name,
        colorHex: flags.colorHex,
        color: flags.color,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      name: cliScalarFlagParams.requiredString("Label name"),
      colorHex: cliScalarFlagParams.optionalString("Label color as hexadecimal"),
      color: cliScalarFlagParams.optionalNumber("Label color number"),
    },
  },
  docs: { brief: "Create a label" },
})

const updateCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { labelId: string; name: string; colorHex?: string; color?: number },
  ) {
    await cliRunApi(this, flags, (config) =>
      labelUpdate({
        config,
        session: flags.session,
        labelId: flags.labelId,
        name: flags.name,
        colorHex: flags.colorHex,
        color: flags.color,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      labelId: cliScalarFlagParams.requiredString("Label id"),
      name: cliScalarFlagParams.requiredString("Label name"),
      colorHex: cliScalarFlagParams.optionalString("Label color as hexadecimal"),
      color: cliScalarFlagParams.optionalNumber("Label color number"),
    },
  },
  docs: { brief: "Update a label" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { labelId: string }) {
    await cliRunApi(this, flags, (config) =>
      labelDelete({
        config,
        session: flags.session,
        labelId: flags.labelId,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      labelId: cliScalarFlagParams.requiredString("Label id"),
    },
  },
  docs: { brief: "Delete a label" },
})

const chatListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { chatId: string }) {
    await cliRunApi(this, flags, (config) =>
      labelChatList({
        config,
        session: flags.session,
        chatId: flags.chatId,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      chatId: cliScalarFlagParams.requiredString("Chat id"),
    },
  },
  docs: { brief: "List labels assigned to a chat" },
})

const chatSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { chatId: string; labelsJson: string }) {
    const labels = cliJsonParse(flags.labelsJson, "labelChatSet", "labelsJson")
    if (!labels.success) cliFail(labels)

    await cliRunApi(this, flags, (config) =>
      labelChatSet({
        config,
        session: flags.session,
        chatId: flags.chatId,
        labels: labels.data as LabelID[],
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      chatId: cliScalarFlagParams.requiredString("Chat id"),
      labelsJson: cliJsonFlagParam("Labels as a JSON array of { id } objects", false) as {
        kind: "parsed"
        parse: typeof String
        brief: string
      },
    },
  },
  docs: { brief: "Set labels assigned to a chat" },
})

const chatsByLabelCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { labelId: string }) {
    await cliRunApi(this, flags, (config) =>
      labelChatsByLabelGet({
        config,
        session: flags.session,
        labelId: flags.labelId,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      labelId: cliScalarFlagParams.requiredString("Label id"),
    },
  },
  docs: { brief: "List chats assigned to a label" },
})

export const labelCommands = buildRouteMap({
  routes: {
    list: listCommand,
    create: createCommand,
    update: updateCommand,
    delete: deleteCommand,
    "chat-list": chatListCommand,
    "chat-set": chatSetCommand,
    "chats-by-label": chatsByLabelCommand,
  },
  docs: { brief: "Label operations" },
})
