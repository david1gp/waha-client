import { buildApplication, buildRouteMap } from "@stricli/core"
import { authCommands } from "./auth/authCommands.js"
import { chatCommands } from "./chats/chatCommands.js"
import { contactCommands } from "./contacts/contactCommands.js"
import { groupCommands } from "./groups/groupCommands.js"
import { messageCommands } from "./messages/messageCommands.js"
import { profileCommands } from "./profile/profileCommands.js"
import { serverCommands } from "./server/serverCommands.js"
import { sessionCommands } from "./sessions/sessionCommands.js"
import { versionCommand } from "./versionCommand.js"

const routes = buildRouteMap({
  routes: {
    version: versionCommand,
    sessions: sessionCommands,
    auth: authCommands,
    chats: chatCommands,
    messages: messageCommands,
    contacts: contactCommands,
    groups: groupCommands,
    server: serverCommands,
    profile: profileCommands,
  },
  docs: {
    brief: "TypeScript client and CLI for WAHA (WhatsApp HTTP API)",
  },
})

export const wahaClientApp = buildApplication(routes, {
  name: "waha-client",
})
