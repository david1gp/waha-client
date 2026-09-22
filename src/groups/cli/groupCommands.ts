import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { groupAdminDemote } from "../groupAdminDemote.js"
import { groupAdminPromote } from "../groupAdminPromote.js"
import { groupCountGet } from "../groupCountGet.js"
import { groupCreate } from "../groupCreate.js"
import { groupDelete } from "../groupDelete.js"
import { groupDescriptionSet } from "../groupDescriptionSet.js"
import { groupGet } from "../groupGet.js"
import { groupInfoAdminOnlyGet } from "../groupInfoAdminOnlyGet.js"
import { groupInfoAdminOnlySet } from "../groupInfoAdminOnlySet.js"
import { groupInviteCodeGet } from "../groupInviteCodeGet.js"
import { groupInviteCodeRevoke } from "../groupInviteCodeRevoke.js"
import { groupJoin } from "../groupJoin.js"
import { groupJoinInfoGet } from "../groupJoinInfoGet.js"
import { groupLeave } from "../groupLeave.js"
import { groupList } from "../groupList.js"
import { groupMemberAddModeGet } from "../groupMemberAddModeGet.js"
import { groupMemberAddModeSet } from "../groupMemberAddModeSet.js"
import { groupMembershipApprovalGet } from "../groupMembershipApprovalGet.js"
import { groupMembershipApprovalSet } from "../groupMembershipApprovalSet.js"
import { groupMessagesAdminOnlyGet } from "../groupMessagesAdminOnlyGet.js"
import { groupMessagesAdminOnlySet } from "../groupMessagesAdminOnlySet.js"
import { groupParticipantAdd } from "../groupParticipantAdd.js"
import { groupParticipantJoinRequestApprove } from "../groupParticipantJoinRequestApprove.js"
import { groupParticipantJoinRequestList } from "../groupParticipantJoinRequestList.js"
import { groupParticipantJoinRequestReject } from "../groupParticipantJoinRequestReject.js"
import { groupParticipantList } from "../groupParticipantList.js"
import { groupParticipantListV2 } from "../groupParticipantListV2.js"
import type { GroupParticipantRef } from "../groupParticipantRef.js"
import { groupParticipantRemove } from "../groupParticipantRemove.js"
import { groupPictureDelete } from "../groupPictureDelete.js"
import { groupPictureGet } from "../groupPictureGet.js"
import { groupPictureSet } from "../groupPictureSet.js"
import { groupRefresh } from "../groupRefresh.js"
import { groupSubjectSet } from "../groupSubjectSet.js"
import { groupPictureFileResolve } from "./groupPictureFileResolve.js"

function requiredJson(value: string, operation: string, flagName: string): unknown {
  const parsed = cliJsonParse(value, operation, flagName)
  if (!parsed.success) cliFail(parsed)
  return parsed.data
}

function requiredJsonFlag(brief: string) {
  return cliJsonFlagParam(brief, false) as { kind: "parsed"; parse: typeof String; brief: string }
}

const listCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      limit?: number
      offset?: number
      sortBy?: string
      sortOrder?: string
      exclude?: string[]
    },
  ) {
    await cliRunApi(this, flags, (config) =>
      groupList({
        config,
        session: flags.session,
        limit: flags.limit,
        offset: flags.offset,
        sortBy: flags.sortBy,
        sortOrder: flags.sortOrder as "asc" | "desc" | undefined,
        exclude: flags.exclude,
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
        brief: "Max groups to return",
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
        brief: "Sort field",
      },
      sortOrder: {
        ...cliScalarFlagParams.optionalString("Sort order: asc | desc"),
      },
      exclude: {
        ...cliScalarFlagParams.optionalStringList("Fields to exclude"),
      },
    },
  },
  docs: { brief: "List groups" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) =>
      groupGet({
        config,
        session: flags.session,
        id: flags.id,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: {
        kind: "parsed",
        parse: String,
        brief: "Group id",
      },
    },
  },
  docs: { brief: "Get group by id" },
})

const createCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { name: string; participantsJson: string }) {
    await cliRunApi(this, flags, (config) =>
      groupCreate({
        config,
        session: flags.session,
        name: flags.name,
        participants: requiredJson(flags.participantsJson, "groupCreate", "participantsJson") as GroupParticipantRef[],
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      name: cliScalarFlagParams.requiredString("Group name"),
      participantsJson: requiredJsonFlag("JSON array of participant objects"),
    },
  },
  docs: { brief: "Create a group" },
})

const countCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => groupCountGet({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Count groups" },
})

const refreshCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => groupRefresh({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Refresh groups" },
})

const joinInfoCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { code: string }) {
    await cliRunApi(this, flags, (config) => groupJoinInfoGet({ config, session: flags.session, code: flags.code }))
  },
  parameters: { flags: { ...cliConfigFlagParams, code: cliScalarFlagParams.requiredString("Invite code") } },
  docs: { brief: "Get group information from an invite code" },
})

const joinCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { code: string }) {
    await cliRunApi(this, flags, (config) => groupJoin({ config, session: flags.session, code: flags.code }))
  },
  parameters: { flags: { ...cliConfigFlagParams, code: cliScalarFlagParams.requiredString("Invite code") } },
  docs: { brief: "Join a group by invite code" },
})

const idOnlyCommands = {
  delete: buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
      await cliRunApi(this, flags, (config) => groupDelete({ config, session: flags.session, id: flags.id }))
    },
    parameters: { flags: { ...cliConfigFlagParams, id: cliScalarFlagParams.requiredString("Group id") } },
    docs: { brief: "Delete a group" },
  }),
  leave: buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
      await cliRunApi(this, flags, (config) => groupLeave({ config, session: flags.session, id: flags.id }))
    },
    parameters: { flags: { ...cliConfigFlagParams, id: cliScalarFlagParams.requiredString("Group id") } },
    docs: { brief: "Leave a group" },
  }),
  pictureDelete: buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
      await cliRunApi(this, flags, (config) => groupPictureDelete({ config, session: flags.session, id: flags.id }))
    },
    parameters: { flags: { ...cliConfigFlagParams, id: cliScalarFlagParams.requiredString("Group id") } },
    docs: { brief: "Delete a group picture" },
  }),
  infoAdminOnly: buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
      await cliRunApi(this, flags, (config) => groupInfoAdminOnlyGet({ config, session: flags.session, id: flags.id }))
    },
    parameters: { flags: { ...cliConfigFlagParams, id: cliScalarFlagParams.requiredString("Group id") } },
    docs: { brief: "Get group info admin-only setting" },
  }),
  messagesAdminOnly: buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
      await cliRunApi(this, flags, (config) =>
        groupMessagesAdminOnlyGet({ config, session: flags.session, id: flags.id }),
      )
    },
    parameters: { flags: { ...cliConfigFlagParams, id: cliScalarFlagParams.requiredString("Group id") } },
    docs: { brief: "Get group messages admin-only setting" },
  }),
  memberAddMode: buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
      await cliRunApi(this, flags, (config) => groupMemberAddModeGet({ config, session: flags.session, id: flags.id }))
    },
    parameters: { flags: { ...cliConfigFlagParams, id: cliScalarFlagParams.requiredString("Group id") } },
    docs: { brief: "Get group member-add setting" },
  }),
  membershipApproval: buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
      await cliRunApi(this, flags, (config) =>
        groupMembershipApprovalGet({ config, session: flags.session, id: flags.id }),
      )
    },
    parameters: { flags: { ...cliConfigFlagParams, id: cliScalarFlagParams.requiredString("Group id") } },
    docs: { brief: "Get group membership approval setting" },
  }),
  inviteCode: buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
      await cliRunApi(this, flags, (config) => groupInviteCodeGet({ config, session: flags.session, id: flags.id }))
    },
    parameters: { flags: { ...cliConfigFlagParams, id: cliScalarFlagParams.requiredString("Group id") } },
    docs: { brief: "Get a group invite code" },
  }),
  inviteCodeRevoke: buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
      await cliRunApi(this, flags, (config) => groupInviteCodeRevoke({ config, session: flags.session, id: flags.id }))
    },
    parameters: { flags: { ...cliConfigFlagParams, id: cliScalarFlagParams.requiredString("Group id") } },
    docs: { brief: "Revoke a group invite code" },
  }),
  participants: buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
      await cliRunApi(this, flags, (config) => groupParticipantList({ config, session: flags.session, id: flags.id }))
    },
    parameters: { flags: { ...cliConfigFlagParams, id: cliScalarFlagParams.requiredString("Group id") } },
    docs: { brief: "List group participants" },
  }),
  participantsV2: buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
      await cliRunApi(this, flags, (config) => groupParticipantListV2({ config, session: flags.session, id: flags.id }))
    },
    parameters: { flags: { ...cliConfigFlagParams, id: cliScalarFlagParams.requiredString("Group id") } },
    docs: { brief: "List group participants using the v2 endpoint" },
  }),
  joinRequests: buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
      await cliRunApi(this, flags, (config) =>
        groupParticipantJoinRequestList({ config, session: flags.session, id: flags.id }),
      )
    },
    parameters: { flags: { ...cliConfigFlagParams, id: cliScalarFlagParams.requiredString("Group id") } },
    docs: { brief: "List group join requests" },
  }),
}

const pictureCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; refresh?: boolean }) {
    await cliRunApi(this, flags, (config) =>
      groupPictureGet({ config, session: flags.session, id: flags.id, refresh: flags.refresh }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Group id"),
      refresh: cliScalarFlagParams.optionalBoolean("Refresh the picture URL"),
    },
  },
  docs: { brief: "Get a group picture" },
})

const pictureSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; file: string }) {
    const file = await groupPictureFileResolve(flags.file)
    if (!file.success) cliFail(file)
    await cliRunApi(this, flags, (config) =>
      groupPictureSet({ config, session: flags.session, id: flags.id, file: file.data }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Group id"),
      file: cliScalarFlagParams.requiredString("Picture file path or URL"),
    },
  },
  docs: { brief: "Set a group picture" },
})

const descriptionSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; description: string }) {
    await cliRunApi(this, flags, (config) =>
      groupDescriptionSet({ config, session: flags.session, id: flags.id, description: flags.description }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Group id"),
      description: cliScalarFlagParams.requiredString("Group description"),
    },
  },
  docs: { brief: "Set a group description" },
})

const subjectSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; subject: string }) {
    await cliRunApi(this, flags, (config) =>
      groupSubjectSet({ config, session: flags.session, id: flags.id, subject: flags.subject }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Group id"),
      subject: cliScalarFlagParams.requiredString("Group subject"),
    },
  },
  docs: { brief: "Set a group subject" },
})

const booleanSettingCommands = {
  infoAdminOnlySet: buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { id: string; adminsOnly: boolean }) {
      await cliRunApi(this, flags, (config) =>
        groupInfoAdminOnlySet({ config, session: flags.session, id: flags.id, adminsOnly: flags.adminsOnly }),
      )
    },
    parameters: {
      flags: {
        ...cliConfigFlagParams,
        id: cliScalarFlagParams.requiredString("Group id"),
        adminsOnly: cliScalarFlagParams.requiredBoolean("Only admins can edit group info"),
      },
    },
    docs: { brief: "Set group info admin-only setting" },
  }),
  messagesAdminOnlySet: buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { id: string; adminsOnly: boolean }) {
      await cliRunApi(this, flags, (config) =>
        groupMessagesAdminOnlySet({ config, session: flags.session, id: flags.id, adminsOnly: flags.adminsOnly }),
      )
    },
    parameters: {
      flags: {
        ...cliConfigFlagParams,
        id: cliScalarFlagParams.requiredString("Group id"),
        adminsOnly: cliScalarFlagParams.requiredBoolean("Only admins can send messages"),
      },
    },
    docs: { brief: "Set group messages admin-only setting" },
  }),
  memberAddModeSet: buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { id: string; membersCanAddNewMember: boolean }) {
      await cliRunApi(this, flags, (config) =>
        groupMemberAddModeSet({
          config,
          session: flags.session,
          id: flags.id,
          membersCanAddNewMember: flags.membersCanAddNewMember,
        }),
      )
    },
    parameters: {
      flags: {
        ...cliConfigFlagParams,
        id: cliScalarFlagParams.requiredString("Group id"),
        membersCanAddNewMember: cliScalarFlagParams.requiredBoolean("Allow members to add members"),
      },
    },
    docs: { brief: "Set group member-add setting" },
  }),
  membershipApprovalSet: buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { id: string; newMembersApprovalRequired: boolean }) {
      await cliRunApi(this, flags, (config) =>
        groupMembershipApprovalSet({
          config,
          session: flags.session,
          id: flags.id,
          newMembersApprovalRequired: flags.newMembersApprovalRequired,
        }),
      )
    },
    parameters: {
      flags: {
        ...cliConfigFlagParams,
        id: cliScalarFlagParams.requiredString("Group id"),
        newMembersApprovalRequired: cliScalarFlagParams.requiredBoolean("Require approval for new members"),
      },
    },
    docs: { brief: "Set group membership approval" },
  }),
}

const participantsAddCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; participantsJson: string }) {
    await cliRunApi(this, flags, (config) =>
      groupParticipantAdd({
        config,
        session: flags.session,
        id: flags.id,
        participants: requiredJson(
          flags.participantsJson,
          "groupParticipantAdd",
          "participantsJson",
        ) as GroupParticipantRef[],
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Group id"),
      participantsJson: requiredJsonFlag("JSON array of participant objects"),
    },
  },
  docs: { brief: "Add group participants" },
})

const participantsRemoveCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; participantsJson: string }) {
    await cliRunApi(this, flags, (config) =>
      groupParticipantRemove({
        config,
        session: flags.session,
        id: flags.id,
        participants: requiredJson(
          flags.participantsJson,
          "groupParticipantRemove",
          "participantsJson",
        ) as GroupParticipantRef[],
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Group id"),
      participantsJson: requiredJsonFlag("JSON array of participant objects"),
    },
  },
  docs: { brief: "Remove group participants" },
})

const joinRequestsApproveCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; participantsJson: string }) {
    await cliRunApi(this, flags, (config) =>
      groupParticipantJoinRequestApprove({
        config,
        session: flags.session,
        id: flags.id,
        participants: requiredJson(
          flags.participantsJson,
          "groupParticipantJoinRequestApprove",
          "participantsJson",
        ) as GroupParticipantRef[],
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Group id"),
      participantsJson: requiredJsonFlag("JSON array of participant objects"),
    },
  },
  docs: { brief: "Approve group join requests" },
})

const joinRequestsRejectCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; participantsJson: string }) {
    await cliRunApi(this, flags, (config) =>
      groupParticipantJoinRequestReject({
        config,
        session: flags.session,
        id: flags.id,
        participants: requiredJson(
          flags.participantsJson,
          "groupParticipantJoinRequestReject",
          "participantsJson",
        ) as GroupParticipantRef[],
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Group id"),
      participantsJson: requiredJsonFlag("JSON array of participant objects"),
    },
  },
  docs: { brief: "Reject group join requests" },
})

const adminPromoteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; participantsJson: string }) {
    await cliRunApi(this, flags, (config) =>
      groupAdminPromote({
        config,
        session: flags.session,
        id: flags.id,
        participants: requiredJson(
          flags.participantsJson,
          "groupAdminPromote",
          "participantsJson",
        ) as GroupParticipantRef[],
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Group id"),
      participantsJson: requiredJsonFlag("JSON array of participant objects"),
    },
  },
  docs: { brief: "Promote group admins" },
})

const adminDemoteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; participantsJson: string }) {
    await cliRunApi(this, flags, (config) =>
      groupAdminDemote({
        config,
        session: flags.session,
        id: flags.id,
        participants: requiredJson(
          flags.participantsJson,
          "groupAdminDemote",
          "participantsJson",
        ) as GroupParticipantRef[],
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Group id"),
      participantsJson: requiredJsonFlag("JSON array of participant objects"),
    },
  },
  docs: { brief: "Demote group admins" },
})

export const groupCommands = buildRouteMap({
  routes: {
    list: listCommand,
    get: getCommand,
    create: createCommand,
    count: countCommand,
    refresh: refreshCommand,
    "join-info": joinInfoCommand,
    join: joinCommand,
    delete: idOnlyCommands.delete,
    leave: idOnlyCommands.leave,
    picture: pictureCommand,
    "picture-set": pictureSetCommand,
    "picture-delete": idOnlyCommands.pictureDelete,
    "description-set": descriptionSetCommand,
    "subject-set": subjectSetCommand,
    "info-admin-only": idOnlyCommands.infoAdminOnly,
    "info-admin-only-set": booleanSettingCommands.infoAdminOnlySet,
    "messages-admin-only": idOnlyCommands.messagesAdminOnly,
    "messages-admin-only-set": booleanSettingCommands.messagesAdminOnlySet,
    "member-add-mode": idOnlyCommands.memberAddMode,
    "member-add-mode-set": booleanSettingCommands.memberAddModeSet,
    "membership-approval": idOnlyCommands.membershipApproval,
    "membership-approval-set": booleanSettingCommands.membershipApprovalSet,
    "invite-code": idOnlyCommands.inviteCode,
    "invite-code-revoke": idOnlyCommands.inviteCodeRevoke,
    participants: idOnlyCommands.participants,
    "participants-v2": idOnlyCommands.participantsV2,
    "participants-add": participantsAddCommand,
    "participants-remove": participantsRemoveCommand,
    "join-requests": idOnlyCommands.joinRequests,
    "join-requests-approve": joinRequestsApproveCommand,
    "join-requests-reject": joinRequestsRejectCommand,
    "admin-promote": adminPromoteCommand,
    "admin-demote": adminDemoteCommand,
  },
  docs: { brief: "Group operations" },
})
