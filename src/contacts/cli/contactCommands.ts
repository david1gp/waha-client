import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { contactAboutGet } from "../contactAboutGet.js"
import { contactBlock } from "../contactBlock.js"
import { contactExistsCheck } from "../contactExistsCheck.js"
import { contactGet } from "../contactGet.js"
import { contactList } from "../contactList.js"
import { contactListAll } from "../contactListAll.js"
import { contactProfilePictureGet } from "../contactProfilePictureGet.js"
import { contactUnblock } from "../contactUnblock.js"
import { contactUpdate } from "../contactUpdate.js"

const listCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      limit?: number
      offset?: number
      sortBy?: string
      sortOrder?: string
    },
  ) {
    await cliRunApi(this, flags, (config) =>
      contactListAll({
        config,
        session: flags.session,
        limit: flags.limit,
        offset: flags.offset,
        sortBy: flags.sortBy as "id" | "name" | undefined,
        sortOrder: flags.sortOrder as "asc" | "desc" | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      limit: {
        kind: "parsed",
        parse: Number,
        optional: true,
        brief: "Max contacts to return",
      },
      offset: {
        kind: "parsed",
        parse: Number,
        optional: true,
        brief: "Offset for pagination",
      },
      sortBy: {
        kind: "parsed",
        parse: String,
        optional: true,
        brief: "Sort field: id | name",
      },
      sortOrder: {
        kind: "parsed",
        parse: String,
        optional: true,
        brief: "Sort order: asc | desc",
      },
    },
  },
  docs: { brief: "List all contacts" },
})

const checkExistsCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { phone: string }) {
    await cliRunApi(this, flags, (config) =>
      contactExistsCheck({
        config,
        session: flags.session,
        phone: flags.phone,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      phone: {
        kind: "parsed",
        parse: String,
        brief: "Phone number to check",
      },
    },
  },
  docs: { brief: "Check if phone number exists on WhatsApp" },
})

const listOneCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { contactId: string }) {
    await cliRunApi(this, flags, (config) =>
      contactList({ config, session: flags.session, contactId: flags.contactId }),
    )
  },
  parameters: { flags: { ...cliConfigFlagParams, contactId: cliScalarFlagParams.requiredString("Contact id") } },
  docs: { brief: "List one contact" },
})

const aboutCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { contactId: string }) {
    await cliRunApi(this, flags, (config) =>
      contactAboutGet({ config, session: flags.session, contactId: flags.contactId }),
    )
  },
  parameters: { flags: { ...cliConfigFlagParams, contactId: cliScalarFlagParams.requiredString("Contact id") } },
  docs: { brief: "Get contact about information" },
})

const profilePictureCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { contactId: string; refresh?: boolean }) {
    await cliRunApi(this, flags, (config) =>
      contactProfilePictureGet({ config, session: flags.session, contactId: flags.contactId, refresh: flags.refresh }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      contactId: cliScalarFlagParams.requiredString("Contact id"),
      refresh: cliScalarFlagParams.optionalBoolean("Refresh the picture URL"),
    },
  },
  docs: { brief: "Get a contact profile picture" },
})

const blockCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { contactId: string }) {
    await cliRunApi(this, flags, (config) =>
      contactBlock({ config, session: flags.session, contactId: flags.contactId }),
    )
  },
  parameters: { flags: { ...cliConfigFlagParams, contactId: cliScalarFlagParams.requiredString("Contact id") } },
  docs: { brief: "Block a contact" },
})

const unblockCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { contactId: string }) {
    await cliRunApi(this, flags, (config) =>
      contactUnblock({ config, session: flags.session, contactId: flags.contactId }),
    )
  },
  parameters: { flags: { ...cliConfigFlagParams, contactId: cliScalarFlagParams.requiredString("Contact id") } },
  docs: { brief: "Unblock a contact" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => contactGet({ config, session: flags.session, id: flags.id }))
  },
  parameters: { flags: { ...cliConfigFlagParams, id: cliScalarFlagParams.requiredString("Contact id") } },
  docs: { brief: "Get a contact by id" },
})

const updateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { chatId: string; firstName: string; lastName: string }) {
    await cliRunApi(this, flags, (config) =>
      contactUpdate({
        config,
        session: flags.session,
        chatId: flags.chatId,
        firstName: flags.firstName,
        lastName: flags.lastName,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      chatId: cliScalarFlagParams.requiredString("Contact chat id"),
      firstName: cliScalarFlagParams.requiredString("First name"),
      lastName: cliScalarFlagParams.requiredString("Last name"),
    },
  },
  docs: { brief: "Update a contact" },
})

export const contactCommands = buildRouteMap({
  routes: {
    list: listCommand,
    "list-one": listOneCommand,
    "check-exists": checkExistsCommand,
    about: aboutCommand,
    "profile-picture": profilePictureCommand,
    block: blockCommand,
    unblock: unblockCommand,
    get: getCommand,
    update: updateCommand,
  },
  docs: { brief: "Contact operations" },
})
