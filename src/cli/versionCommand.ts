import { buildCommand, type CommandContext } from "@stricli/core"
import { PACKAGE_VERSION } from "../packageVersion.js"

async function versionFunc(this: CommandContext) {
  this.process.stdout.write(`${PACKAGE_VERSION}\n`)
}

export const versionCommand = buildCommand({
  func: versionFunc,
  parameters: {},
  docs: {
    brief: "Print package version",
  },
})
