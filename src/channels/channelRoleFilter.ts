import * as a from "valibot"

export const channelRoleFilterSchema = a.picklist(["OWNER", "ADMIN", "SUBSCRIBER"])

export type ChannelRoleFilter = a.InferOutput<typeof channelRoleFilterSchema>
