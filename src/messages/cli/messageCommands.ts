import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { messageButtonsReply } from "../messageButtonsReply.js"
import { messageButtonsSend } from "../messageButtonsSend.js"
import { messageContactVcardSend } from "../messageContactVcardSend.js"
import { messageFileSend } from "../messageFileSend.js"
import { messageForward } from "../messageForward.js"
import { messageIdNewGet } from "../messageIdNewGet.js"
import { messageImageSend } from "../messageImageSend.js"
import { messageLinkCustomPreviewSend } from "../messageLinkCustomPreviewSend.js"
import { messageLinkPreviewSend } from "../messageLinkPreviewSend.js"
import { messageListSend } from "../messageListSend.js"
import { messageLocationSend } from "../messageLocationSend.js"
import { messagePollSend } from "../messagePollSend.js"
import { messagePollVoteSend } from "../messagePollVoteSend.js"
import { messageReactionSet } from "../messageReactionSet.js"
import { messageReply } from "../messageReply.js"
import { messageSeenSend } from "../messageSeenSend.js"
import { messageStarSet } from "../messageStarSet.js"
import { messageStickerSend } from "../messageStickerSend.js"
import { messageTextSend } from "../messageTextSend.js"
import { messageVideoSend } from "../messageVideoSend.js"
import { messageVoiceSend } from "../messageVoiceSend.js"
import { messagesGet } from "../messagesGet.js"
import { numberStatusCheck } from "../numberStatusCheck.js"
import { messageFileResolve } from "./messageFileResolve.js"
import { messageStickerFileResolve } from "./messageStickerFileResolve.js"

const flags = cliConfigFlagParams as any
const s = cliScalarFlagParams as any
const json = cliJsonFlagParam as any

function parseJson(value: string | undefined, operation: string, flag: string): unknown {
  const result = cliJsonParse(value, operation, flag)
  if (!result.success) cliFail(result)
  return result.data
}

async function resolveFile(value: string, mimetype: string) {
  const result = await messageFileResolve(value, mimetype)
  if (!result.success) cliFail(result)
  return result.data
}

const sendTextCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      messageTextSend({
        config,
        session: f.session,
        chatId: f.chatId as string,
        text: f.text as string,
        id: f.id as string | undefined,
        mentions: f.mentions as string[] | undefined,
        reply_to: f.reply_to as string | undefined,
        linkPreview: f.linkPreview as boolean | undefined,
        linkPreviewHighQuality: f.linkPreviewHighQuality as boolean | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      text: s.requiredString("Message text"),
      id: s.optionalString("Message id"),
      mentions: s.optionalStringList("Mentioned phone numbers"),
      reply_to: s.optionalString("Message id to reply to"),
      linkPreview: s.optionalBoolean("Enable link preview"),
      linkPreviewHighQuality: s.optionalBoolean("Use high quality link preview"),
    },
  },
  docs: { brief: "Send a text message" },
})

const sendStickerCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & { chatId: string; file: string; reply_to?: string }) {
    const fileResult = await messageStickerFileResolve(f.file)
    if (!fileResult.success) cliFail(fileResult)
    await cliRunApi(this, f, (config) =>
      messageStickerSend({ config, session: f.session, chatId: f.chatId, file: fileResult.data, reply_to: f.reply_to }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      file: s.requiredString("WebP file path or URL"),
      reply_to: s.optionalString("Message id to reply to"),
    },
  },
  docs: { brief: "Send a sticker message" },
})

function fileCommand(operation: "image" | "file" | "voice" | "video") {
  const mime = { image: "image/jpeg", file: "application/octet-stream", voice: "audio/ogg", video: "video/mp4" }[
    operation
  ]
  return async function resolve(value: string) {
    return resolveFile(value, mime)
  }
}

const sendImageCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    const file = await fileCommand("image")(f.file as string)
    await cliRunApi(this, f, (config) =>
      messageImageSend({
        config,
        session: f.session,
        chatId: f.chatId as string,
        file,
        caption: f.caption as string | undefined,
        mentions: f.mentions as string[] | undefined,
        reply_to: f.reply_to as string | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      file: s.requiredString("Image file path or URL"),
      caption: s.optionalString("Caption"),
      mentions: s.optionalStringList("Mentioned phone numbers"),
      reply_to: s.optionalString("Message id to reply to"),
    },
  },
  docs: { brief: "Send an image message" },
})

const sendFileCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    const file = await fileCommand("file")(f.file as string)
    await cliRunApi(this, f, (config) =>
      messageFileSend({
        config,
        session: f.session,
        chatId: f.chatId as string,
        file,
        caption: f.caption as string | undefined,
        mentions: f.mentions as string[] | undefined,
        reply_to: f.reply_to as string | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      file: s.requiredString("File path or URL"),
      caption: s.optionalString("Caption"),
      mentions: s.optionalStringList("Mentioned phone numbers"),
      reply_to: s.optionalString("Message id to reply to"),
    },
  },
  docs: { brief: "Send a file message" },
})

const sendVoiceCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    const file = await fileCommand("voice")(f.file as string)
    await cliRunApi(this, f, (config) =>
      messageVoiceSend({
        config,
        session: f.session,
        chatId: f.chatId as string,
        file,
        reply_to: f.reply_to as string | undefined,
        convert: f.convert as boolean | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      file: s.requiredString("Audio file path or URL"),
      reply_to: s.optionalString("Message id to reply to"),
      convert: s.optionalBoolean("Convert audio"),
    },
  },
  docs: { brief: "Send a voice message" },
})

const sendVideoCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    const file = await fileCommand("video")(f.file as string)
    await cliRunApi(this, f, (config) =>
      messageVideoSend({
        config,
        session: f.session,
        chatId: f.chatId as string,
        file,
        caption: f.caption as string | undefined,
        mentions: f.mentions as string[] | undefined,
        reply_to: f.reply_to as string | undefined,
        asNote: f.asNote as boolean | undefined,
        convert: f.convert as boolean | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      file: s.requiredString("Video file path or URL"),
      caption: s.optionalString("Caption"),
      mentions: s.optionalStringList("Mentioned phone numbers"),
      reply_to: s.optionalString("Message id to reply to"),
      asNote: s.optionalBoolean("Send as a note"),
      convert: s.optionalBoolean("Convert video"),
    },
  },
  docs: { brief: "Send a video message" },
})

const sendLinkCustomPreviewCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    const preview = parseJson(f.previewJson as string, "messageLinkCustomPreviewSend", "previewJson")
    await cliRunApi(this, f, (config) =>
      messageLinkCustomPreviewSend({
        config,
        session: f.session,
        chatId: f.chatId as string,
        text: f.text as string,
        preview: preview as never,
        linkPreviewHighQuality: f.linkPreviewHighQuality as boolean | undefined,
        reply_to: f.reply_to as string | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      text: s.requiredString("Message text"),
      previewJson: json("Link preview JSON", false),
      linkPreviewHighQuality: s.optionalBoolean("Use high quality link preview"),
      reply_to: s.optionalString("Message id to reply to"),
    },
  },
  docs: { brief: "Send a message with a custom link preview" },
})

const sendButtonsCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    const buttons = parseJson(f.buttonsJson as string, "messageButtonsSend", "buttonsJson")
    const headerImage =
      f.headerImageJson === undefined
        ? undefined
        : parseJson(f.headerImageJson as string, "messageButtonsSend", "headerImageJson")
    await cliRunApi(this, f, (config) =>
      messageButtonsSend({
        config,
        session: f.session,
        chatId: f.chatId as string,
        buttons: buttons as never,
        header: f.header as string | undefined,
        headerImage: headerImage as never,
        body: f.body as string | undefined,
        footer: f.footer as string | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      buttonsJson: json("Buttons JSON", false),
      header: s.optionalString("Header"),
      headerImageJson: json("Header image WahaFile JSON"),
      body: s.optionalString("Body"),
      footer: s.optionalString("Footer"),
    },
  },
  docs: { brief: "Send an interactive buttons message" },
})

const sendListCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    const message = parseJson(f.messageJson as string, "messageListSend", "messageJson")
    await cliRunApi(this, f, (config) =>
      messageListSend({
        config,
        session: f.session,
        chatId: f.chatId as string,
        message: message as never,
        reply_to: f.reply_to as string | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      messageJson: json("List message JSON", false),
      reply_to: s.optionalString("Message id to reply to"),
    },
  },
  docs: { brief: "Send a list message" },
})

const forwardCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      messageForward({
        config,
        session: f.session,
        chatId: f.chatId as string,
        messageId: f.messageId as string,
        id: f.id as string | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Destination chat id"),
      messageId: s.requiredString("Message id"),
      id: s.optionalString("New message id"),
    },
  },
  docs: { brief: "Forward a message" },
})

const seenCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      messageSeenSend({
        config,
        session: f.session,
        chatId: f.chatId as string,
        messageId: f.messageId as string | undefined,
        messageIds: f.messageIds as string[] | undefined,
        participant: f.participant as string | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      messageId: s.optionalString("Message id"),
      messageIds: s.optionalStringList("Message ids"),
      participant: s.optionalString("Participant"),
    },
  },
  docs: { brief: "Mark messages as seen" },
})

const reactionCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      messageReactionSet({
        config,
        session: f.session,
        messageId: f.messageId as string,
        reaction: f.reaction as string,
      }),
    )
  },
  parameters: {
    flags: { ...flags, messageId: s.requiredString("Message id"), reaction: s.requiredString("Reaction emoji") },
  },
  docs: { brief: "Set or remove a reaction" },
})

const starCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      messageStarSet({
        config,
        session: f.session,
        messageId: f.messageId as string,
        chatId: f.chatId as string,
        star: f.star as boolean,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      messageId: s.requiredString("Message id"),
      chatId: s.requiredString("Chat id"),
      star: s.requiredBoolean("Star message"),
    },
  },
  docs: { brief: "Star or unstar a message" },
})

const pollCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    const poll = parseJson(f.pollJson as string, "messagePollSend", "pollJson")
    await cliRunApi(this, f, (config) =>
      messagePollSend({
        config,
        session: f.session,
        chatId: f.chatId as string,
        poll: poll as never,
        id: f.id as string | undefined,
        reply_to: f.reply_to as string | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      pollJson: json("Poll JSON", false),
      id: s.optionalString("Message id"),
      reply_to: s.optionalString("Message id to reply to"),
    },
  },
  docs: { brief: "Send a poll" },
})

const votePollCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      messagePollVoteSend({
        config,
        session: f.session,
        chatId: f.chatId as string,
        pollMessageId: f.pollMessageId as string,
        votes: f.votes as string[],
        pollServerId: f.pollServerId as number | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      pollMessageId: s.requiredString("Poll message id"),
      votes: { ...s.optionalStringList("Selected votes"), optional: false as const },
      pollServerId: s.optionalNumber("Poll server id"),
    },
  },
  docs: { brief: "Vote in a poll" },
})

const locationCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      messageLocationSend({
        config,
        session: f.session,
        chatId: f.chatId as string,
        latitude: f.latitude as number,
        longitude: f.longitude as number,
        title: f.title as string,
        id: f.id as string | undefined,
        reply_to: f.reply_to as string | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      latitude: s.requiredNumber("Latitude"),
      longitude: s.requiredNumber("Longitude"),
      title: s.requiredString("Location title"),
      id: s.optionalString("Message id"),
      reply_to: s.optionalString("Message id to reply to"),
    },
  },
  docs: { brief: "Send a location" },
})

const contactVcardCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    const contacts = parseJson(f.contactsJson as string, "messageContactVcardSend", "contactsJson")
    await cliRunApi(this, f, (config) =>
      messageContactVcardSend({
        config,
        session: f.session,
        chatId: f.chatId as string,
        contacts: contacts as never,
        id: f.id as string | undefined,
        reply_to: f.reply_to as string | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      contactsJson: json("Contacts JSON", false),
      id: s.optionalString("Message id"),
      reply_to: s.optionalString("Message id to reply to"),
    },
  },
  docs: { brief: "Send contact cards" },
})

const replyButtonsCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      messageButtonsReply({
        config,
        session: f.session,
        chatId: f.chatId as string,
        replyTo: f.replyTo as string,
        selectedDisplayText: f.selectedDisplayText as string,
        selectedButtonID: f.selectedButtonID as string,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      replyTo: s.requiredString("Button message id"),
      selectedDisplayText: s.requiredString("Selected button text"),
      selectedButtonID: s.requiredString("Selected button id"),
    },
  },
  docs: { brief: "Reply to a buttons message" },
})

const replyCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      messageReply({
        config,
        session: f.session,
        chatId: f.chatId as string,
        text: f.text as string,
        id: f.id as string | undefined,
        mentions: f.mentions as string[] | undefined,
        reply_to: f.reply_to as string | undefined,
        linkPreview: f.linkPreview as boolean | undefined,
        linkPreviewHighQuality: f.linkPreviewHighQuality as boolean | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      text: s.requiredString("Reply text"),
      id: s.optionalString("Message id"),
      mentions: s.optionalStringList("Mentioned phone numbers"),
      reply_to: s.optionalString("Message id to reply to"),
      linkPreview: s.optionalBoolean("Enable link preview"),
      linkPreviewHighQuality: s.optionalBoolean("Use high quality link preview"),
    },
  },
  docs: { brief: "Reply with a text message" },
})

const linkPreviewCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      messageLinkPreviewSend({
        config,
        session: f.session,
        chatId: f.chatId as string,
        url: f.url as string,
        title: f.title as string,
        id: f.id as string | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      url: s.requiredString("URL"),
      title: s.requiredString("Link title"),
      id: s.optionalString("Message id"),
    },
  },
  docs: { brief: "Send a link preview" },
})

const numberStatusCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) => numberStatusCheck({ config, session: f.session, phone: f.phone as string }))
  },
  parameters: { flags: { ...flags, phone: s.requiredString("Phone number") } },
  docs: { brief: "Check a phone number status" },
})

const messageIdNewCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags) {
    await cliRunApi(this, f, (config) => messageIdNewGet({ config, session: f.session }))
  },
  parameters: { flags },
  docs: { brief: "Generate a new message id" },
})

const listCommand = buildCommand({
  async func(this: CommandContext, f: CliConfigFlags & Record<string, unknown>) {
    await cliRunApi(this, f, (config) =>
      messagesGet({
        config,
        session: f.session,
        chatId: f.chatId as string,
        limit: f.limit as number | undefined,
        offset: f.offset as number | undefined,
        sortBy: f.sortBy as string | undefined,
        sortOrder: f.sortOrder as "asc" | "desc" | undefined,
        downloadMedia: f.downloadMedia as boolean | undefined,
        merge: f.merge as boolean | undefined,
        "filter.timestamp.lte": f.filterTimestampLte as number | undefined,
        "filter.timestamp.gte": f.filterTimestampGte as number | undefined,
        "filter.fromMe": f.filterFromMe as boolean | undefined,
        "filter.ack": f.filterAck as string | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...flags,
      chatId: s.requiredString("Chat id"),
      limit: s.optionalNumber("Max messages"),
      offset: s.optionalNumber("Offset"),
      sortBy: s.optionalString("Sort field"),
      sortOrder: s.optionalString("Sort order: asc | desc"),
      downloadMedia: s.optionalBoolean("Download media"),
      merge: s.optionalBoolean("Merge messages"),
      filterTimestampLte: s.optionalNumber("Latest timestamp filter"),
      filterTimestampGte: s.optionalNumber("Earliest timestamp filter"),
      filterFromMe: s.optionalBoolean("Filter messages sent by me"),
      filterAck: s.optionalString("Acknowledgement filter"),
    },
  },
  docs: { brief: "List messages" },
})

export const messageCommands = buildRouteMap({
  routes: {
    "send-text": sendTextCommand,
    "send-sticker": sendStickerCommand,
    "send-image": sendImageCommand,
    "send-file": sendFileCommand,
    "send-voice": sendVoiceCommand,
    "send-video": sendVideoCommand,
    "send-link-custom-preview": sendLinkCustomPreviewCommand,
    "send-buttons": sendButtonsCommand,
    "send-list": sendListCommand,
    forward: forwardCommand,
    "send-seen": seenCommand,
    "set-reaction": reactionCommand,
    "set-star": starCommand,
    "send-poll": pollCommand,
    "vote-poll": votePollCommand,
    "send-location": locationCommand,
    "send-contact-vcard": contactVcardCommand,
    "reply-buttons": replyButtonsCommand,
    reply: replyCommand,
    "send-link-preview": linkPreviewCommand,
    "number-status": numberStatusCommand,
    "message-id-new": messageIdNewCommand,
    list: listCommand,
  },
  docs: { brief: "Send and manage messages" },
})
