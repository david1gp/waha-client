import { buildApplication, buildRouteMap } from "@stricli/core"
import { apiKeyCommands } from "../apiKeys/cli/apiKeyCommands.js"
import { appCommands } from "../apps/cli/appCommands.js"
import { PACKAGE_VERSION } from "../client/PACKAGE_VERSION.js"
import { authCommands } from "../auth/cli/authCommands.js"
import { callCommands } from "../calls/cli/callCommands.js"
import { channelCommands } from "../channels/cli/channelCommands.js"
import { chatCommands } from "../chats/cli/chatCommands.js"
import { contactCommands } from "../contacts/cli/contactCommands.js"
import { eventsCommands } from "../events/cli/eventsCommands.js"
import { groupCommands } from "../groups/cli/groupCommands.js"
import { labelCommands } from "../labels/cli/labelCommands.js"
import { lidCommands } from "../lids/cli/lidCommands.js"
import { mediaCommands } from "../media/cli/mediaCommands.js"
import { messageCommands } from "../messages/cli/messageCommands.js"
import { presenceCommands } from "../presence/cli/presenceCommands.js"
import { profileCommands } from "../profile/cli/profileCommands.js"
import { serverCommands } from "../server/cli/serverCommands.js"
import { sessionCommands } from "../sessions/cli/sessionCommands.js"
import { statusCommands } from "../status/cli/statusCommands.js"
import { storageCommands } from "../media/cli/storageCommands.js"
import { versionCommand } from "./versionCommand.js"

const routes = buildRouteMap({
  routes: {
    version: versionCommand,
    "api-keys": apiKeyCommands,
    apps: appCommands,
    sessions: sessionCommands,
    auth: authCommands,
    calls: callCommands,
    channels: channelCommands,
    chats: chatCommands,
    messages: messageCommands,
    contacts: contactCommands,
    events: eventsCommands,
    groups: groupCommands,
    labels: labelCommands,
    lids: lidCommands,
    media: mediaCommands,
    storage: storageCommands,
    presence: presenceCommands,
    server: serverCommands,
    profile: profileCommands,
    status: statusCommands,
  },
  docs: {
    brief: "TypeScript client and CLI for WAHA (WhatsApp HTTP API)",
  },
})

export const wahaClientApp = buildApplication(routes, {
  name: "waha-client",
  versionInfo: {
    currentVersion: PACKAGE_VERSION,
  },
})
