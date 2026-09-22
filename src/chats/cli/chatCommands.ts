import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { chatArchive } from "../chatArchive.js"
import { chatDelete } from "../chatDelete.js"
import { chatList } from "../chatList.js"
import { chatMessageDelete } from "../chatMessageDelete.js"
import { chatMessageDeleteAll } from "../chatMessageDeleteAll.js"
import { chatMessageEdit } from "../chatMessageEdit.js"
import { chatMessageGet } from "../chatMessageGet.js"
import { chatMessageList } from "../chatMessageList.js"
import { chatMessagePin } from "../chatMessagePin.js"
import { chatMessageRead } from "../chatMessageRead.js"
import { chatMessageUnpin } from "../chatMessageUnpin.js"
import { chatOverviewGet } from "../chatOverviewGet.js"
import { chatOverviewPost } from "../chatOverviewPost.js"
import { chatPictureGet } from "../chatPictureGet.js"
import { chatUnarchive } from "../chatUnarchive.js"
import { chatUnread } from "../chatUnread.js"

const flags = cliConfigFlagParams as any
const s = cliScalarFlagParams as any
const json = cliJsonFlagParam as any

function parseJson(value: string | undefined, operation: string, flag: string): unknown {
  const result = cliJsonParse(value, operation, flag)
  if (!result.success) cliFail(result)
  return result.data
}

const listCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      chatList({
        config,
        session: f.session,
        limit: f.limit as number | undefined,
        offset: f.offset as number | undefined,
        sortBy: f.sortBy as never,
        sortOrder: f.sortOrder as never,
        merge: f.merge as boolean | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      limit: s.optionalNumber("Max chats to return"),
      offset: s.optionalNumber("Offset for pagination"),
      sortBy: s.optionalString("Sort field: conversationTimestamp | id | name"),
      sortOrder: s.optionalString("Sort order: asc | desc"),
      merge: s.optionalBoolean("Merge chat list"),
    },
  },
  docs: { brief: "List chats" },
})

const overviewCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      chatOverviewGet({
        config,
        session: f.session,
        limit: f.limit as number | undefined,
        offset: f.offset as number | undefined,
        merge: f.merge as boolean | undefined,
        ids: f.ids as string[] | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      limit: s.optionalNumber("Max chats"),
      offset: s.optionalNumber("Offset"),
      merge: s.optionalBoolean("Merge chats"),
      ids: s.optionalStringList("Chat ids"),
    },
  },
  docs: { brief: "Get chat overview" },
})

const overviewPostCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    const pagination = parseJson(f.paginationJson as string, "chatOverviewPost", "paginationJson")
    const filter =
      f.filterJson === undefined ? undefined : parseJson(f.filterJson as string, "chatOverviewPost", "filterJson")
    await cliRunApi(this, f, (config) =>
      chatOverviewPost({ config, session: f.session, pagination: pagination as never, filter: filter as never }),
    )
  },
  parameters: { flags: { ...flags, paginationJson: json("Pagination JSON", false), filterJson: json("Filter JSON") } },
  docs: { brief: "Post a chat overview query" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) => chatDelete({ config, session: f.session, chatId: f.chatId as string }))
  },
  parameters: { flags: { ...flags, chatId: s.requiredString("Chat id") } },
  docs: { brief: "Delete a chat" },
})

const pictureCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      chatPictureGet({
        config,
        session: f.session,
        chatId: f.chatId as string,
        refresh: f.refresh as boolean | undefined,
      }),
    )
  },
  parameters: {
    flags: { ...flags, chatId: s.requiredString("Chat id"), refresh: s.optionalBoolean("Refresh picture") },
  },
  docs: { brief: "Get a chat picture" },
})

const messagesCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      chatMessageList({
        config,
        session: f.session,
        chatId: f.chatId as string,
        limit: f.limit as number | undefined,
        offset: f.offset as number | undefined,
        sortBy: f.sortBy as never,
        sortOrder: f.sortOrder as never,
        downloadMedia: f.downloadMedia as boolean | undefined,
        merge: f.merge as boolean | undefined,
        filterTimestampLte: f.filterTimestampLte as number | undefined,
        filterTimestampGte: f.filterTimestampGte as number | undefined,
        filterFromMe: f.filterFromMe as boolean | undefined,
        filterAck: f.filterAck as never,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      limit: s.optionalNumber("Max messages"),
      offset: s.optionalNumber("Offset"),
      sortBy: s.optionalString("Sort field: timestamp | messageTimestamp"),
      sortOrder: s.optionalString("Sort order: asc | desc"),
      downloadMedia: s.optionalBoolean("Download media"),
      merge: s.optionalBoolean("Merge messages"),
      filterTimestampLte: s.optionalNumber("Latest timestamp filter"),
      filterTimestampGte: s.optionalNumber("Earliest timestamp filter"),
      filterFromMe: s.optionalBoolean("Filter messages sent by me"),
      filterAck: s.optionalString("Acknowledgement filter"),
    },
  },
  docs: { brief: "List chat messages" },
})

const messagesDeleteAllCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      chatMessageDeleteAll({ config, session: f.session, chatId: f.chatId as string }),
    )
  },
  parameters: { flags: { ...flags, chatId: s.requiredString("Chat id") } },
  docs: { brief: "Delete all messages in a chat" },
})

const messageReadCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      chatMessageRead({
        config,
        session: f.session,
        chatId: f.chatId as string,
        messages: f.messages as number | undefined,
        days: f.days as number | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      messages: s.optionalNumber("Number of messages"),
      days: s.optionalNumber("Number of days"),
    },
  },
  docs: { brief: "Mark chat messages as read" },
})

const messageGetCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      chatMessageGet({
        config,
        session: f.session,
        chatId: f.chatId as string,
        messageId: f.messageId as string,
        downloadMedia: f.downloadMedia as boolean | undefined,
        merge: f.merge as boolean | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      messageId: s.requiredString("Message id"),
      downloadMedia: s.optionalBoolean("Download media"),
      merge: s.optionalBoolean("Merge message"),
    },
  },
  docs: { brief: "Get a chat message" },
})

const messageDeleteCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      chatMessageDelete({ config, session: f.session, chatId: f.chatId as string, messageId: f.messageId as string }),
    )
  },
  parameters: { flags: { ...flags, chatId: s.requiredString("Chat id"), messageId: s.requiredString("Message id") } },
  docs: { brief: "Delete a chat message" },
})

const messageEditCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      chatMessageEdit({
        config,
        session: f.session,
        chatId: f.chatId as string,
        messageId: f.messageId as string,
        text: f.text as string,
        mentions: f.mentions as string[] | undefined,
        linkPreview: f.linkPreview as boolean | undefined,
        linkPreviewHighQuality: f.linkPreviewHighQuality as boolean | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      messageId: s.requiredString("Message id"),
      text: s.requiredString("Message text"),
      mentions: s.optionalStringList("Mentioned phone numbers"),
      linkPreview: s.optionalBoolean("Enable link preview"),
      linkPreviewHighQuality: s.optionalBoolean("Use high quality link preview"),
    },
  },
  docs: { brief: "Edit a chat message" },
})

const messagePinCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      chatMessagePin({
        config,
        session: f.session,
        chatId: f.chatId as string,
        messageId: f.messageId as string,
        duration: f.duration as never,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      messageId: s.requiredString("Message id"),
      duration: s.requiredNumber("Pin duration in seconds: 86400, 604800, or 2592000"),
    },
  },
  docs: { brief: "Pin a chat message" },
})

const messageUnpinCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      chatMessageUnpin({ config, session: f.session, chatId: f.chatId as string, messageId: f.messageId as string }),
    )
  },
  parameters: { flags: { ...flags, chatId: s.requiredString("Chat id"), messageId: s.requiredString("Message id") } },
  docs: { brief: "Unpin a chat message" },
})

const archiveCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) => chatArchive({ config, session: f.session, chatId: f.chatId as string }))
  },
  parameters: { flags: { ...flags, chatId: s.requiredString("Chat id") } },
  docs: { brief: "Archive a chat" },
})

const unarchiveCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) => chatUnarchive({ config, session: f.session, chatId: f.chatId as string }))
  },
  parameters: { flags: { ...flags, chatId: s.requiredString("Chat id") } },
  docs: { brief: "Unarchive a chat" },
})

const unreadCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) => chatUnread({ config, session: f.session, chatId: f.chatId as string }))
  },
  parameters: { flags: { ...flags, chatId: s.requiredString("Chat id") } },
  docs: { brief: "Mark a chat unread" },
})

export const chatCommands = buildRouteMap({
  routes: {
    list: listCommand,
    overview: overviewCommand,
    "overview-post": overviewPostCommand,
    delete: deleteCommand,
    picture: pictureCommand,
    messages: messagesCommand,
    "messages-delete-all": messagesDeleteAllCommand,
    "message-read": messageReadCommand,
    "message-get": messageGetCommand,
    "message-delete": messageDeleteCommand,
    "message-edit": messageEditCommand,
    "message-pin": messagePinCommand,
    "message-unpin": messageUnpinCommand,
    archive: archiveCommand,
    unarchive: unarchiveCommand,
    unread: unreadCommand,
  },
  docs: { brief: "Chat operations" },
})
