import * as a from "valibot"
import { createResult, createResultError, type Result } from "#result"
import type { GroupInfo, GroupParticipant } from "./groupTypes.js"

const groupParticipantSchema = a.object({
  id: a.string(),
  pn: a.optional(a.string()),
  role: a.picklist(["left", "participant", "admin", "superadmin"]),
})

const gowsGroupParticipantSchema = a.object({
  JID: a.string(),
  PhoneNumber: a.string(),
  IsAdmin: a.boolean(),
  IsSuperAdmin: a.boolean(),
  Error: a.optional(a.number()),
})

const groupInfoResponseSchema = a.object({
  jid: a.optional(a.string()),
  name: a.optional(a.string()),
  id: a.optional(a.string()),
  subject: a.optional(a.string()),
  description: a.optional(a.string()),
  participants: a.optional(a.array(groupParticipantSchema)),
  invite: a.optional(a.string()),
  membersCanAddNewMember: a.optional(a.boolean()),
  membersCanSendMessages: a.optional(a.boolean()),
  newMembersApprovalRequired: a.optional(a.boolean()),
  JID: a.optional(a.string()),
  OwnerJID: a.optional(a.string()),
  Name: a.optional(a.string()),
  Topic: a.optional(a.string()),
  IsLocked: a.optional(a.boolean()),
  IsAnnounce: a.optional(a.boolean()),
  Participants: a.optional(a.array(gowsGroupParticipantSchema)),
  MemberAddMode: a.optional(a.string()),
  IsJoinApprovalRequired: a.optional(a.boolean()),
})

function gowsJidToCusFormat(jid: string): string {
  if (jid === "" || jid.endsWith("@g.us") || jid.endsWith("@broadcast") || jid.endsWith("@newsletter")) {
    return jid
  }
  if (jid.endsWith("@lid")) return jid.replace(/:\d+(?=@)/, "")
  if (jid === "me") return jid
  return `${jid.split("@")[0]?.split(":")[0]}@c.us`
}

function gowsParticipantsToGroupParticipants(
  participants: Array<a.InferOutput<typeof gowsGroupParticipantSchema>>,
): GroupParticipant[] {
  return participants.map((participant) => ({
    id: gowsJidToCusFormat(participant.JID),
    pn: gowsJidToCusFormat(participant.PhoneNumber),
    role: participant.IsSuperAdmin ? "superadmin" : participant.IsAdmin ? "admin" : "participant",
  }))
}

export function groupInfoResponseNormalize(raw: unknown, op: string): Result<GroupInfo> {
  const parsed = a.safeParse(groupInfoResponseSchema, raw)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(raw))

  const value = parsed.output
  const jid = value.jid ?? value.id ?? value.JID
  if (jid === undefined) return createResultError(op, "Group response jid is required", JSON.stringify(raw))

  const name = value.name ?? value.subject ?? value.Name
  if (name === undefined) return createResultError(op, "Group response name is required", JSON.stringify(raw))

  const result: GroupInfo = { jid, name }
  const description = value.description ?? value.Topic
  if (description !== undefined) result.description = description
  if (value.participants !== undefined) {
    result.participants = value.participants
  } else if (value.Participants !== undefined) {
    result.participants = gowsParticipantsToGroupParticipants(value.Participants)
  }
  if (value.invite !== undefined) result.invite = value.invite
  if (value.membersCanAddNewMember !== undefined) {
    result.membersCanAddNewMember = value.membersCanAddNewMember
  } else if (value.MemberAddMode === "all_member_add" || value.MemberAddMode === "admin_add") {
    result.membersCanAddNewMember = value.MemberAddMode === "all_member_add"
  }
  if (value.membersCanSendMessages !== undefined) {
    result.membersCanSendMessages = value.membersCanSendMessages
  } else if (value.IsAnnounce !== undefined) {
    result.membersCanSendMessages = value.IsAnnounce
  }
  if (value.newMembersApprovalRequired !== undefined) {
    result.newMembersApprovalRequired = value.newMembersApprovalRequired
  } else if (value.IsJoinApprovalRequired !== undefined) {
    result.newMembersApprovalRequired = value.IsJoinApprovalRequired
  }
  return createResult(result)
}
