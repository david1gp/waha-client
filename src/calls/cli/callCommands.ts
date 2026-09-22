import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { callReject } from "../callReject.js"

const rejectCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { from: string; id: string }) {
    await cliRunApi(this, flags, (config) =>
      callReject({ config, session: flags.session, from: flags.from, id: flags.id }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      from: { kind: "parsed", parse: String, brief: "Caller phone number" },
      id: { kind: "parsed", parse: String, brief: "Call ID" },
    },
  },
  docs: { brief: "Reject an incoming call" },
})

export const callCommands = buildRouteMap({
  routes: { reject: rejectCommand },
  docs: { brief: "Call operations" },
})
