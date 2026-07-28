import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChannelCountry } from "./channelTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const channelSearchCountriesGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export type ChannelSearchCountriesGetOptions = {
  config: WahaClientConfig
  session?: string
}

export async function channelSearchCountriesGet(
  options: ChannelSearchCountriesGetOptions,
): PromiseResult<ChannelCountry[]> {
  const op = "channelSearchCountriesGet"
  const parsed = a.safeParse(channelSearchCountriesGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ChannelCountry[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/channels/search/countries"),
  })
}
