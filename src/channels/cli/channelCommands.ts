import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import * as a from "valibot"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import type { WahaFile } from "../../media/wahaFile.js"
import { channelCreate } from "../channelCreate.js"
import { channelDelete } from "../channelDelete.js"
import { channelFollow } from "../channelFollow.js"
import { channelGet } from "../channelGet.js"
import { channelList } from "../channelList.js"
import { channelMessagePreviewGet } from "../channelMessagePreviewGet.js"
import { channelMute } from "../channelMute.js"
import { type ChannelRoleFilter, channelRoleFilterSchema } from "../channelRoleFilter.js"
import { channelSearchByText } from "../channelSearchByText.js"
import { channelSearchByView } from "../channelSearchByView.js"
import { channelSearchCategoriesGet } from "../channelSearchCategoriesGet.js"
import { channelSearchCountriesGet } from "../channelSearchCountriesGet.js"
import { channelSearchViewsGet } from "../channelSearchViewsGet.js"
import { channelUnfollow } from "../channelUnfollow.js"
import { channelUnmute } from "../channelUnmute.js"

function channelRoleParse(value: string): ChannelRoleFilter {
  const parsed = a.safeParse(channelRoleFilterSchema, value)
  if (parsed.success) return parsed.output
  throw new Error("Expected OWNER, ADMIN, or SUBSCRIBER")
}

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { role?: ChannelRoleFilter }) {
    await cliRunApi(this, flags, (config) =>
      channelList({
        config,
        session: flags.session,
        role: flags.role,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      role: {
        kind: "parsed",
        parse: channelRoleParse,
        optional: true,
        brief: "Channel role: OWNER | ADMIN | SUBSCRIBER",
      },
    },
  },
  docs: { brief: "List channels" },
})

const createCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { name: string; description?: string; pictureJson?: string },
  ) {
    const picture = cliJsonParse(flags.pictureJson, "channelCreate", "pictureJson")
    if (!picture.success) cliFail(picture)

    await cliRunApi(this, flags, (config) =>
      channelCreate({
        config,
        session: flags.session,
        name: flags.name,
        description: flags.description,
        picture: picture.data as WahaFile | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      name: cliScalarFlagParams.requiredString("Channel name"),
      description: cliScalarFlagParams.optionalString("Channel description"),
      pictureJson: cliJsonFlagParam("Channel picture as a WahaFile JSON object", true) as {
        kind: "parsed"
        parse: typeof String
        optional: true
        brief: string
      },
    },
  },
  docs: { brief: "Create a channel" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) =>
      channelGet({
        config,
        session: flags.session,
        id: flags.id,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Channel id"),
    },
  },
  docs: { brief: "Get a channel" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) =>
      channelDelete({
        config,
        session: flags.session,
        id: flags.id,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Channel id"),
    },
  },
  docs: { brief: "Delete a channel" },
})

const messagePreviewCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; downloadMedia?: boolean; limit?: number }) {
    await cliRunApi(this, flags, (config) =>
      channelMessagePreviewGet({
        config,
        session: flags.session,
        id: flags.id,
        downloadMedia: flags.downloadMedia,
        limit: flags.limit,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Channel id"),
      downloadMedia: cliScalarFlagParams.optionalBoolean("Download media in messages"),
      limit: cliScalarFlagParams.optionalNumber("Maximum messages to return"),
    },
  },
  docs: { brief: "Get channel message previews" },
})

const followCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) =>
      channelFollow({
        config,
        session: flags.session,
        id: flags.id,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Channel id"),
    },
  },
  docs: { brief: "Follow a channel" },
})

const unfollowCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) =>
      channelUnfollow({
        config,
        session: flags.session,
        id: flags.id,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Channel id"),
    },
  },
  docs: { brief: "Unfollow a channel" },
})

const muteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) =>
      channelMute({
        config,
        session: flags.session,
        id: flags.id,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Channel id"),
    },
  },
  docs: { brief: "Mute a channel" },
})

const unmuteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) =>
      channelUnmute({
        config,
        session: flags.session,
        id: flags.id,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Channel id"),
    },
  },
  docs: { brief: "Unmute a channel" },
})

const searchByViewCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      view?: string
      countries?: string[]
      categories?: string[]
      limit?: number
      startCursor?: string
    },
  ) {
    await cliRunApi(this, flags, (config) =>
      channelSearchByView({
        config,
        session: flags.session,
        view: flags.view,
        countries: flags.countries,
        categories: flags.categories,
        limit: flags.limit,
        startCursor: flags.startCursor,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      view: cliScalarFlagParams.optionalString("Channel view"),
      countries: cliScalarFlagParams.optionalStringList("Comma-separated country codes"),
      categories: cliScalarFlagParams.optionalStringList("Comma-separated channel categories"),
      limit: cliScalarFlagParams.optionalNumber("Maximum channels to return"),
      startCursor: cliScalarFlagParams.optionalString("Pagination cursor"),
    },
  },
  docs: { brief: "Search channels by view" },
})

const searchByTextCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { text: string; categories?: string[]; limit?: number; startCursor?: string },
  ) {
    await cliRunApi(this, flags, (config) =>
      channelSearchByText({
        config,
        session: flags.session,
        text: flags.text,
        categories: flags.categories,
        limit: flags.limit,
        startCursor: flags.startCursor,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      text: cliScalarFlagParams.requiredString("Search text"),
      categories: cliScalarFlagParams.optionalStringList("Comma-separated channel categories"),
      limit: cliScalarFlagParams.optionalNumber("Maximum channels to return"),
      startCursor: cliScalarFlagParams.optionalString("Pagination cursor"),
    },
  },
  docs: { brief: "Search channels by text" },
})

const searchViewsCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => channelSearchViewsGet({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List channel search views" },
})

const searchCountriesCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => channelSearchCountriesGet({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List channel search countries" },
})

const searchCategoriesCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => channelSearchCategoriesGet({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List channel search categories" },
})

export const channelCommands = buildRouteMap({
  routes: {
    list: listCommand,
    create: createCommand,
    get: getCommand,
    delete: deleteCommand,
    "message-preview": messagePreviewCommand,
    follow: followCommand,
    unfollow: unfollowCommand,
    mute: muteCommand,
    unmute: unmuteCommand,
    "search-by-view": searchByViewCommand,
    "search-by-text": searchByTextCommand,
    "search-views": searchViewsCommand,
    "search-countries": searchCountriesCommand,
    "search-categories": searchCategoriesCommand,
  },
  docs: { brief: "Channel operations" },
})
