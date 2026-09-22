import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ServerDebugCpuGetOptions = {
  config: WahaClientConfig
  /** Sample duration in seconds (server default: 30). */
  seconds?: number
}

/** CPU profile as JSON (.cpuprofile content). */
