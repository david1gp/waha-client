import type { ChannelSearchCountriesGetOptions } from "./channelSearchCountriesGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChannelCountry } from "./channelCountry.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const channelSearchCountriesGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export async function channelSearchCountriesGet(
  options: ChannelSearchCountriesGetOptions,
): PromiseResult<ChannelCountry[]> {
  const op = "channelSearchCountriesGet"
  const parsed = a.safeParse(channelSearchCountriesGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ChannelCountry[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/channels/search/countries"),
  })
}
