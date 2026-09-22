import type { ContactProfilePictureGetOptions } from "./contactProfilePictureGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ContactProfilePicture } from "./contactProfilePicture.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const contactProfilePictureGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  contactId: a.pipe(a.string(), a.minLength(1)),
  refresh: a.optional(a.boolean()),
})

export async function contactProfilePictureGet(
  options: ContactProfilePictureGetOptions,
): PromiseResult<ContactProfilePicture> {
  const op = "contactProfilePictureGet"
  const parsed = a.safeParse(contactProfilePictureGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, contactId, refresh } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ContactProfilePicture>({
    config,
    method: "GET",
    path: wahaPathApi("/contacts/profile-picture"),
    query: {
      session: sessionR.data,
      contactId,
      refresh,
    },
  })
}
