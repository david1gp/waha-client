#!/usr/bin/env bun
import { run } from "@stricli/core"
import { wahaClientApp } from "./cli/cliApp.js"

await run(wahaClientApp, process.argv.slice(2), { process })
