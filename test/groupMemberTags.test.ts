import { afterEach, describe, expect, mock, test } from "bun:test"
import { groupMemberShareHistoryModeGet } from "../src/groups/groupMemberShareHistoryModeGet.js"
import { groupMemberShareHistoryModeSet } from "../src/groups/groupMemberShareHistoryModeSet.js"
import { groupParticipantTagGet } from "../src/groups/groupParticipantTagGet.js"
import { groupParticipantTagMyGet } from "../src/groups/groupParticipantTagMyGet.js"
import { groupParticipantTagMySet } from "../src/groups/groupParticipantTagMySet.js"
import { groupParticipantTagsGet } from "../src/groups/groupParticipantTagsGet.js"
import * as publicApi from "../src/index.js"
import { wahaClientConfig } from "../src/client/wahaClientConfig.js"

describe("groupMemberTags", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  function config() {
    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", apiKey: "k", session: "default" })
    expect(configR.success).toBe(true)
    if (!configR.success) throw new Error("config must validate")
    return configR.data
  }

  test("exposes WAHA 2026.10 group tag and share-history operations", () => {
    expect(publicApi.groupParticipantTagsGet).toBe(groupParticipantTagsGet)
    expect(publicApi.groupParticipantTagGet).toBe(groupParticipantTagGet)
    expect(publicApi.groupParticipantTagMyGet).toBe(groupParticipantTagMyGet)
    expect(publicApi.groupParticipantTagMySet).toBe(groupParticipantTagMySet)
    expect(publicApi.groupMemberShareHistoryModeGet).toBe(groupMemberShareHistoryModeGet)
    expect(publicApi.groupMemberShareHistoryModeSet).toBe(groupMemberShareHistoryModeSet)
  })

  test("groupParticipantTagsGet GET /api/{session}/groups/{id}/participants/v2/tags", async () => {
    const tags = [{ id: "123@lid", tag: "Manager", timestamp: 1666943582 }]
    globalThis.fetch = mock(async () => new Response(JSON.stringify(tags), { status: 200 })) as unknown as typeof fetch

    const r = await groupParticipantTagsGet({ config: config(), id: "1@g.us" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(tags)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups/1%40g.us/participants/v2/tags")
    expect(init.method).toBe("GET")
  })

  test("groupParticipantTagGet GET single participant tag", async () => {
    const tag = { id: "123@lid", tag: "Support", timestamp: 1666943582 }
    globalThis.fetch = mock(async () => new Response(JSON.stringify(tag), { status: 200 })) as unknown as typeof fetch

    const r = await groupParticipantTagGet({ config: config(), id: "1@g.us", participantId: "123@lid" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(tag)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups/1%40g.us/participants/v2/tags/123%40lid")
    expect(init.method).toBe("GET")
  })

  test("groupParticipantTagMyGet GET own tag with explicit session", async () => {
    const tag = { id: "999@lid", tag: null, timestamp: null }
    globalThis.fetch = mock(async () => new Response(JSON.stringify(tag), { status: 200 })) as unknown as typeof fetch

    const r = await groupParticipantTagMyGet({ config: config(), session: "other", id: "1@g.us" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(tag)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/other/groups/1%40g.us/participants/v2/tags/my")
  })

  test("groupParticipantTagMySet PUT own tag", async () => {
    globalThis.fetch = mock(async () => new Response(JSON.stringify(true), { status: 200 })) as unknown as typeof fetch

    const r = await groupParticipantTagMySet({ config: config(), id: "1@g.us", tag: "Manager" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups/1%40g.us/participants/v2/tags/my")
    expect(init.method).toBe("PUT")
    expect(JSON.parse(init.body as string)).toEqual({ tag: "Manager" })
  })

  test("groupParticipantTagMySet PUT null tag removes it", async () => {
    globalThis.fetch = mock(async () => new Response(JSON.stringify(true), { status: 200 })) as unknown as typeof fetch

    const r = await groupParticipantTagMySet({ config: config(), id: "1@g.us", tag: null })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [, init] = calls[0] as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toEqual({ tag: null })
  })

  test("groupMemberShareHistoryModeGet GET setting", async () => {
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify({ membersCanShareHistory: true }), { status: 200 }),
    ) as unknown as typeof fetch

    const r = await groupMemberShareHistoryModeGet({ config: config(), id: "1@g.us" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ membersCanShareHistory: true })

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups/1%40g.us/settings/security/member-share-history-mode")
    expect(init.method).toBe("GET")
  })

  test("groupMemberShareHistoryModeSet PUT setting", async () => {
    globalThis.fetch = mock(async () => new Response(JSON.stringify(false), { status: 200 })) as unknown as typeof fetch

    const r = await groupMemberShareHistoryModeSet({
      config: config(),
      id: "1@g.us",
      membersCanShareHistory: false,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe(false)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups/1%40g.us/settings/security/member-share-history-mode")
    expect(init.method).toBe("PUT")
    expect(JSON.parse(init.body as string)).toEqual({ membersCanShareHistory: false })
  })
})
