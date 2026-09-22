# CLI parity inventory

This is the task 1 hand-off for the remaining CLI adapters. It is derived from the
operation exports and their `*Options` types under `src/`; it deliberately does not
infer request signatures from route names. `config` is supplied by the existing
`cliRunApi`/`cliConfigFlagParams` convention and is omitted below.

## Adapter conventions

- Keep one explicit Stricli command per operation. Do not add a generic route or
  dynamically construct commands from option keys.
- Preserve the library option property name in the adapter. Existing CLI spelling is
  camelCase (for example `--chatId`, `--sortOrder`) and the API's literal `reply_to`
  is retained where it is an option property. A command may choose a documented
  alias, but the adapter must forward the exact library key.
- Every option with `session?: string` gets the shared `--session` flag and passes
  `session: flags.session` unchanged. Do not resolve it in the CLI; the operation
  owns `config.session` fallback. Operations without `session` must not gain one.
- Required scalar options use `cliScalarFlagParams.requiredString/requiredNumber`;
  optional scalars use the corresponding `optional*` factory. Use
  `optionalStringList` for comma-separated string arrays when no nested structure is
  involved. Enum values should use an explicit Stricli enum descriptor or the
  operation's validation, never an unchecked cast based only on a route name.
- Nested records and arrays get an explicit `cliJsonFlagParam(...)` flag. Parse them
  with `cliJsonParse(value, operationName, flagName)`, fail the CLI on the returned
  `ResultErr`, and pass the parsed value unchanged to the library operation. The
  parser checks JSON syntax only; the library operation remains authoritative for
  shape validation.
- Use `cliJsonFlagParam(brief, false)` when the JSON input is required; the default
  descriptor is optional.
- `WahaFile` inputs are also nested values. Use the existing file resolver pattern or
  a domain-specific resolver, and document the flag as `file`/`fileJson`; do not
  flatten `WahaFile` into guessed scalar fields.
- `Uint8Array` results use `...cliBinaryOutputFlagParams` and
  `cliBinaryOutput(bytes, flags.output)`. With no output path the adapter must
  print the returned `{ encoding: "base64", data }` JSON; with a path it writes bytes
  and prints no JSON. This covers QR image, files, S3 objects, traces,
  heap snapshots, screenshots, and media conversion without stringifying a byte
  array. Picture-get operations currently return JSON URL/object responses and do
  not use this binary helper.
- `void` results use the existing JSON writer with the operation result (normally
  `undefined`) rather than inventing a success payload. Streaming operations need
  their own lifecycle adapter and must not be forced through `cliRunApi`.

### Shared helper usage

```ts
const bodyJson = cliJsonParse(flags.bodyJson, "appCreate", "bodyJson")
if (!bodyJson.success) cliFail(bodyJson)

const result = await appCreate({ config, body: bodyJson.data as App })
if (!result.success) cliFail(result)

const binary = await cliBinaryOutput(result.data, flags.output)
if (!binary.success) cliFail(binary)
if (binary.data !== undefined) cliWriteJson(this, binary.data)
```

The `as App` above is an adapter-local type assertion only after the explicit JSON
flag has been selected; operation validation still runs. Prefer a Valibot schema in
the adapter when the nested type has a stable schema. Do not add a universal
`operation + flags -> call` helper.

## Existing commands needing option-parity amendments

These operations already have commands, but their current adapters do not expose
all options. They are not repeated in the missing-operation tables.

| Operation | Existing command | Required amendment |
|---|---|---|
| `sessionList` | `sessions list` | Add `--expand` as an explicit string-list flag; retain `--all`. |
| `sessionCreate` | `sessions create` | Add required `sessionConfig` JSON and optional `apps` JSON; retain `name` and `start`. |
| `sessionGet` | `sessions get` | Add `expand` string-list forwarding; `--session` remains the identifier. |
| `chatList` | `chats list` | Current `limit`, `offset`, `sortBy`, `sortOrder`, `merge` are complete. |
| `contactListAll` | `contacts list` | Current pagination/sort forwarding is complete; keep distinct from `contactList`. |
| `groupList` | `groups list` | Add `--exclude` string-list forwarding in addition to pagination/sort. |
| `events observe` (`wahaWebSocketObserveMany`) | `events observe` | Add explicit `--events` list; retain CLI `--limit`; keep unknown payload semantics documented. |
| `authQrGet` | `auth qr` | Reject unknown formats instead of silently treating them as `raw`; add binary output path support for `image`. |
| `messageTextSend` | `messages send-text` | Add existing option fields `--id`, `--mentions`, `--reply_to`, `--linkPreview`, and `--linkPreviewHighQuality`. |
| `messages send-sticker` | `messages send-sticker` | Existing file resolver and `reply_to` forwarding are complete. |

## Missing operation inventory

Notation in the tables: `S` means shared `--session`; `I` means an identifier;
`Q` means a scalar query/filter option; `J` means a JSON flag parsed by
`cliJsonParse`; `B` means `cliBinaryOutput`; `F` means a `WahaFile` input/resolver.
Flag names below are the intended explicit names, not inferred positional arguments.

### Sessions (4 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `sessionUpdate` | `sessions update` | `S`; `--session` `I`; `--sessionConfigJson` J required; `--appsJson` J optional. |
| `sessionsStart` | `sessions start-all` | `--name` optional; `--sessionConfigJson` J required. |
| `sessionsStop` | `sessions stop-all` | `--name` optional; `--logout` optional boolean. |
| `sessionsLogout` | `sessions logout-all` | `--name` optional. |

### Authentication (4 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `authPasskeyChallengeGet` | `auth passkey-challenge` | `S`. |
| `authPasskeyConfirmationGet` | `auth passkey-confirmation` | `S`. |
| `authPasskeyConfirm` | `auth passkey-confirm` | `S`; no body fields in the current `AuthPasskeyConfirmOptions`. |
| `authPasskeyPost` | `auth passkey-post` | `S`; `--id`, `--rawId`, `--type` scalars; `--responseJson` J required for `response`. |

### Profile (4 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `profileNameSet` | `profile name-set` | `S`; required `--name`. |
| `profileStatusSet` | `profile status-set` | `S`; required `--status`. |
| `profilePictureSet` | `profile picture-set` | `S`; required `--file` F. |
| `profilePictureDelete` | `profile picture-delete` | `S`. |

### Server and diagnostics (6 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `serverStop` | `server stop` | optional `--force` boolean. |
| `serverEnvironmentGet` | `server environment` | optional `--all` boolean. |
| `serverDebugCpuGet` | `server debug-cpu` | optional `--seconds` number; result is JSON CPU profile. |
| `serverDebugHeapsnapshotGet` | `server debug-heapsnapshot` | `B`; `--output` via `cliBinaryOutputFlagParams`. |
| `serverDebugBrowserTraceGet` | `server debug-browser-trace` | `S`; required `--seconds` number; optional `--categories` string-list; `B`. |
| `screenshotGet` | `server screenshot` | `S`; `B`. |

### Events and WebSocket (3 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `wahaWebSocketObserve` | `events observe-one` | `S`; optional `--events` string-list and CLI `--limit`/lifecycle controls; output JSON lines. |
| `eventCreate` | `events create` | `S`; required `--chatId`; required `--eventJson` J; optional `--reply_to`. |
| `eventCancel` | `events cancel` | `S`; required `--id`; expose despite possible upstream support gaps. |

### Messages (21 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `messageImageSend` | `messages send-image` | `S`; required `--chatId`, `--file` F; optional `--caption`, `--mentions` Q/list, `--reply_to`. |
| `messageFileSend` | `messages send-file` | `S`; required `--chatId`, `--file` F; optional `--caption`, `--mentions`, `--reply_to`. |
| `messageVoiceSend` | `messages send-voice` | `S`; required `--chatId`, `--file` F; optional `--reply_to`, `--convert`. |
| `messageVideoSend` | `messages send-video` | `S`; required `--chatId`, `--file` F; optional `--caption`, `--mentions`, `--reply_to`, `--asNote`, `--convert`. |
| `messageLinkCustomPreviewSend` | `messages send-link-custom-preview` | `S`; required `--chatId`, `--text`, `--previewJson` J; optional `--linkPreviewHighQuality`, `--reply_to`. |
| `messageButtonsSend` | `messages send-buttons` | `S`; required `--chatId`, `--buttonsJson` J; optional `--header`, `--headerImageJson` J/F, `--body`, `--footer`. |
| `messageListSend` | `messages send-list` | `S`; required `--chatId`, `--messageJson` J; optional `--reply_to`. |
| `messageForward` | `messages forward` | `S`; required `--chatId`, `--messageId`; optional `--id`. |
| `messageSeenSend` | `messages send-seen` | `S`; required `--chatId`; optional `--messageId`, `--messageIds` list, `--participant`. |
| `messageReactionSet` | `messages set-reaction` | `S`; required `--messageId`, `--reaction`. |
| `messageStarSet` | `messages set-star` | `S`; required `--messageId`, `--chatId`, `--star`. |
| `messagePollSend` | `messages send-poll` | `S`; required `--chatId`, `--pollJson` J; optional `--id`, `--reply_to`. |
| `messagePollVoteSend` | `messages vote-poll` | `S`; required `--chatId`, `--pollMessageId`, `--votes` list; optional `--pollServerId` number. |
| `messageLocationSend` | `messages send-location` | `S`; required `--chatId`, `--latitude`, `--longitude`, `--title`; optional `--id`, `--reply_to`. |
| `messageContactVcardSend` | `messages send-contact-vcard` | `S`; required `--chatId`, `--contactsJson` J; optional `--id`, `--reply_to`. |
| `messageButtonsReply` | `messages reply-buttons` | `S`; required `--chatId`, `--replyTo`, `--selectedDisplayText`, `--selectedButtonID`. |
| `messageReply` | `messages reply` | `S`; required `--chatId`, `--text`; optional `--id`, `--mentions`, `--reply_to`, `--linkPreview`, `--linkPreviewHighQuality`. |
| `messageLinkPreviewSend` | `messages send-link-preview` | `S`; required `--chatId`, `--url`, `--title`; optional `--id`. |
| `numberStatusCheck` | `messages number-status` | `S`; required `--phone`. |
| `messageIdNewGet` | `messages message-id-new` | `S`. |
| `messagesGet` | `messages list` | `S`; required `--chatId`; Q `--limit`, `--offset`, `--sortBy`, `--sortOrder`, `--downloadMedia`, `--merge`; preserve any literal query/filter keys implemented by the operation. |

### Chats (15 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `chatOverviewGet` | `chats overview` | `S`; Q `--limit`, `--offset`, `--merge`, `--ids` list. |
| `chatOverviewPost` | `chats overview-post` | `S`; required `--paginationJson` J; optional `--filterJson` J. |
| `chatDelete` | `chats delete` | `S`; required `--chatId` I. |
| `chatPictureGet` | `chats picture` | `S`; required `--chatId` I; optional `--refresh`; result may be URL/object, not assumed binary. |
| `chatMessageList` | `chats messages` | `S`; required `--chatId`; Q `--limit`, `--offset`, `--sortBy`, `--sortOrder`, `--downloadMedia`, `--merge`, `--filterTimestampLte`, `--filterTimestampGte`, `--filterFromMe`, `--filterAck`. |
| `chatMessageDeleteAll` | `chats messages-delete-all` | `S`; required `--chatId`. |
| `chatMessageRead` | `chats message-read` | `S`; required `--chatId`; optional `--messages` number and `--days` number. |
| `chatMessageGet` | `chats message-get` | `S`; required `--chatId`, `--messageId`; optional `--downloadMedia`, `--merge`. |
| `chatMessageDelete` | `chats message-delete` | `S`; required `--chatId`, `--messageId`. |
| `chatMessageEdit` | `chats message-edit` | `S`; required `--chatId`, `--messageId`, `--text`; optional `--mentions`, `--linkPreview`, `--linkPreviewHighQuality`. |
| `chatMessagePin` | `chats message-pin` | `S`; required `--chatId`, `--messageId`, `--duration`. |
| `chatMessageUnpin` | `chats message-unpin` | `S`; required `--chatId`, `--messageId`. |
| `chatArchive` | `chats archive` | `S`; required `--chatId`. |
| `chatUnarchive` | `chats unarchive` | `S`; required `--chatId`. |
| `chatUnread` | `chats unread` | `S`; required `--chatId`. |

### Groups (30 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `groupCreate` | `groups create` | `S`; required `--name`, `--participantsJson` J. |
| `groupCountGet` | `groups count` | `S`. |
| `groupRefresh` | `groups refresh` | `S`. |
| `groupJoinInfoGet` | `groups join-info` | `S`; required `--code` I. |
| `groupJoin` | `groups join` | `S`; required `--code` I. |
| `groupDelete` | `groups delete` | `S`; required `--id` I. |
| `groupLeave` | `groups leave` | `S`; required `--id` I. |
| `groupPictureGet` | `groups picture` | `S`; required `--id` I; optional `--refresh`; output shape must follow library result. |
| `groupPictureSet` | `groups picture-set` | `S`; required `--id`, `--file` F. |
| `groupPictureDelete` | `groups picture-delete` | `S`; required `--id`. |
| `groupDescriptionSet` | `groups description-set` | `S`; required `--id`, `--description`. |
| `groupSubjectSet` | `groups subject-set` | `S`; required `--id`, `--subject`. |
| `groupInfoAdminOnlyGet` | `groups info-admin-only` | `S`; required `--id`. |
| `groupInfoAdminOnlySet` | `groups info-admin-only-set` | `S`; required `--id`, `--adminsOnly`. |
| `groupMessagesAdminOnlyGet` | `groups messages-admin-only` | `S`; required `--id`. |
| `groupMessagesAdminOnlySet` | `groups messages-admin-only-set` | `S`; required `--id`, `--adminsOnly`. |
| `groupMemberAddModeGet` | `groups member-add-mode` | `S`; required `--id`. |
| `groupMemberAddModeSet` | `groups member-add-mode-set` | `S`; required `--id`, `--membersCanAddNewMember`. |
| `groupMembershipApprovalGet` | `groups membership-approval` | `S`; required `--id`. |
| `groupMembershipApprovalSet` | `groups membership-approval-set` | `S`; required `--id`, `--newMembersApprovalRequired`. |
| `groupInviteCodeGet` | `groups invite-code` | `S`; required `--id`. |
| `groupInviteCodeRevoke` | `groups invite-code-revoke` | `S`; required `--id`. |
| `groupParticipantList` | `groups participants` | `S`; required `--id`. |
| `groupParticipantListV2` | `groups participants-v2` | `S`; required `--id`. |
| `groupParticipantAdd` | `groups participants-add` | `S`; required `--id`, `--participantsJson` J. |
| `groupParticipantRemove` | `groups participants-remove` | `S`; required `--id`, `--participantsJson` J. |
| `groupParticipantJoinRequestList` | `groups join-requests` | `S`; required `--id`. |
| `groupParticipantJoinRequestApprove` | `groups join-requests-approve` | `S`; required `--id`, `--participantsJson` J. |
| `groupParticipantJoinRequestReject` | `groups join-requests-reject` | `S`; required `--id`, `--participantsJson` J. |
| `groupAdminPromote` / `groupAdminDemote` | `groups admin-promote` / `groups admin-demote` | `S`; required `--id`, `--participantsJson` J. |

`groupList` is existing but must also expose `--exclude` (see amendments).

### Contacts and LIDs (11 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `contactList` | `contacts list-one` | `S`; required `--contactId` I. Keep separate from `contactListAll` / `contacts list`. |
| `contactAboutGet` | `contacts about` | `S`; required `--contactId` I. |
| `contactProfilePictureGet` | `contacts profile-picture` | `S`; required `--contactId` I; optional `--refresh`; output follows library result. |
| `contactBlock` | `contacts block` | `S`; required `--contactId` I. |
| `contactUnblock` | `contacts unblock` | `S`; required `--contactId` I. |
| `contactGet` | `contacts get` | `S`; required `--id` I. |
| `contactUpdate` | `contacts update` | `S`; required `--chatId`, `--firstName`, `--lastName`. |
| `lidList` | `lids list` | `S`; Q `--limit`, `--offset`. |
| `lidCountGet` | `lids count` | `S`. |
| `lidGet` | `lids get` | `S`; required `--lid` I. |
| `lidByPhoneGet` | `lids by-phone` | `S`; required `--phoneNumber`. |

`contactExistsCheck` is already `contacts check-exists`; no duplicate command is
planned. There are seven missing contact operations and four missing LID operations.

### Channels (13 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `channelList` | `channels list` | `S`; optional `--role`. |
| `channelCreate` | `channels create` | `S`; required `--name`; optional `--description`, `--pictureJson` J/F. |
| `channelGet` | `channels get` | `S`; required `--id` I. |
| `channelDelete` | `channels delete` | `S`; required `--id` I. |
| `channelMessagePreviewGet` | `channels message-preview` | `S`; required `--id`; optional `--downloadMedia`, `--limit`. |
| `channelFollow` / `channelUnfollow` | `channels follow` / `channels unfollow` | `S`; required `--id`. |
| `channelMute` / `channelUnmute` | `channels mute` / `channels unmute` | `S`; required `--id`. |
| `channelSearchByView` | `channels search-by-view` | `S`; optional `--view`, `--countries`, `--categories`, `--limit`, `--startCursor`. |
| `channelSearchByText` | `channels search-by-text` | `S`; required `--text`; optional `--categories`, `--limit`, `--startCursor`. |
| `channelSearchViewsGet` | `channels search-views` | `S`. |
| `channelSearchCountriesGet` | `channels search-countries` | `S`. |
| `channelSearchCategoriesGet` | `channels search-categories` | `S`. |

### Labels (7 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `labelList` | `labels list` | `S`. |
| `labelCreate` | `labels create` | `S`; required `--name`; optional `--colorHex`, `--color`. |
| `labelUpdate` | `labels update` | `S`; required `--labelId`, `--name`; optional `--colorHex`, `--color`. |
| `labelDelete` | `labels delete` | `S`; required `--labelId`. |
| `labelChatList` | `labels chat-list` | `S`; required `--chatId`. |
| `labelChatSet` | `labels chat-set` | `S`; required `--chatId`, `--labelsJson` J. |
| `labelChatsByLabelGet` | `labels chats-by-label` | `S`; required `--labelId`. |

### Presence (6 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `presenceSet` | `presence set` | `S`; required `--presence` enum; optional `--chatId`. |
| `presenceList` | `presence list` | `S`. |
| `presenceGet` | `presence get` | `S`; required `--chatId`. |
| `presenceSubscribe` | `presence subscribe` | `S`; required `--chatId`; one-shot void result. |
| `typingStart` | `presence typing-start` | `S`; required `--chatId`. |
| `typingStop` | `presence typing-stop` | `S`; required `--chatId`. |

### API keys (6 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `apiKeyCreate` | `api-keys create` | optional `--bodyJson` J; no operation-level `session`. |
| `apiKeyList` | `api-keys list` | no operation-level `session`. |
| `apiKeyMediaCreate` | `api-keys media-create` | `S`. |
| `apiKeyControlCreate` | `api-keys control-create` | `S`. |
| `apiKeyUpdate` | `api-keys update` | required `--id`; optional `--bodyJson` J; no operation-level `session`. |
| `apiKeyDelete` | `api-keys delete` | required `--id`; no operation-level `session`. |

### Apps (6 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `appList` | `apps list` | `S` (the option type includes it). |
| `appCreate` | `apps create` | required `--bodyJson` J; no operation-level `session`. |
| `appGet` | `apps get` | required `--id`; no operation-level `session`. |
| `appUpdate` | `apps update` | required `--id`, `--bodyJson` J; no operation-level `session`. |
| `appDelete` | `apps delete` | required `--id`; no operation-level `session`. |
| `appChatwootLocalesGet` | `apps chatwoot-locales` | no operation-specific options. |

### Storage and media conversion (5 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `fileGet` | `storage file-get` | `S`; required path parts as explicit positional path array or repeated `--pathPart`; `B`. |
| `fileDelete` | `storage file-delete` | `S`; required path parts as explicit positional path array or repeated `--pathPart`; void result. |
| `s3ObjectGet` | `storage s3-object-get` | required `--bucket` and path parts; no `session`; `B`. |
| `mediaVoiceConvert` | `media voice-convert` | `S`; optional `--url` or `--data` (adapter should require at least one); `B`. |
| `mediaVideoConvert` | `media video-convert` | `S`; optional `--url` or `--data` (adapter should require at least one); `B`. |

### Status (6 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `statusTextSend` | `status send-text` | `S`; required `--text`; optional `--backgroundColor`, `--font`, `--linkPreview`, `--linkPreviewHighQuality`, `--id`, `--contacts`. |
| `statusImageSend` | `status send-image` | `S`; required `--file` F; optional `--caption`, `--id`, `--contacts`. |
| `statusVoiceSend` | `status send-voice` | `S`; required `--file` F; optional `--backgroundColor`, `--convert`, `--id`, `--contacts`. |
| `statusVideoSend` | `status send-video` | `S`; required `--file` F; optional `--caption`, `--convert`, `--id`, `--contacts`. |
| `statusDelete` | `status delete` | `S`; required `--id`; optional `--contacts`. |
| `statusMessageIdNewGet` | `status message-id-new` | `S`. |

### Calls (1 missing)

| Operation | Command | Forwarding |
|---|---|---|
| `callReject` | `calls reject` | `S`; required `--from`, `--id`; void result. |

## Explicit exclusions and blockers

- `sessionResolveName`, `authResolveSession`, `wahaResolveSession`, and other
  exported request/configuration helpers are not public API operations for CLI
  parity. They remain internal adapter/library helpers.
- Types, schemas, constants, response normalizers, and path/request helpers are not
  commands.
- `presenceSubscribe` is an ordinary void HTTP call despite its name. WebSocket
  observe commands need shared readiness, signal cleanup, limit, and JSON-lines
  handling; they are not ordinary one-shot calls.
- `eventCancel` is mapped even if a particular WAHA deployment does not implement
  the upstream endpoint; the library Result error must be surfaced unchanged.
- No command should guess a nested schema from a route. The current option types
  require JSON for session configs, passkey response data, message payloads,
  participants, labels, app/API-key bodies, event messages, overview filters, and
  similar records.
