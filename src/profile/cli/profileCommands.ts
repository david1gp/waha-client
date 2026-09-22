import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { profileGet } from "../profileGet.js"
import { profileNameSet } from "../profileNameSet.js"
import { profilePictureDelete } from "../profilePictureDelete.js"
import { profilePictureSet } from "../profilePictureSet.js"
import { profileStatusSet } from "../profileStatusSet.js"
import { profilePictureFileResolve } from "./profilePictureFileResolve.js"

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => profileGet({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Get my profile" },
})

const nameSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { name: string }) {
    await cliRunApi(this, flags, (config) => profileNameSet({ config, session: flags.session, name: flags.name }))
  },
  parameters: { flags: { ...cliConfigFlagParams, name: cliScalarFlagParams.requiredString("Profile name") } },
  docs: { brief: "Set profile name" },
})

const statusSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { status: string }) {
    await cliRunApi(this, flags, (config) => profileStatusSet({ config, session: flags.session, status: flags.status }))
  },
  parameters: { flags: { ...cliConfigFlagParams, status: cliScalarFlagParams.requiredString("Profile status") } },
  docs: { brief: "Set profile status" },
})

const pictureSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { file: string }) {
    const fileResult = await profilePictureFileResolve(flags.file)
    if (!fileResult.success) cliFail(fileResult)
    await cliRunApi(this, flags, (config) =>
      profilePictureSet({ config, session: flags.session, file: fileResult.data }),
    )
  },
  parameters: { flags: { ...cliConfigFlagParams, file: cliScalarFlagParams.requiredString("Image file path or URL") } },
  docs: { brief: "Set profile picture" },
})

const pictureDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => profilePictureDelete({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Delete profile picture" },
})

export const profileCommands = buildRouteMap({
  routes: {
    get: getCommand,
    "name-set": nameSetCommand,
    "status-set": statusSetCommand,
    "picture-set": pictureSetCommand,
    "picture-delete": pictureDeleteCommand,
  },
  docs: { brief: "Profile operations" },
})
