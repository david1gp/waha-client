import { afterEach, describe, expect, mock, test } from "bun:test"
import { join } from "node:path"
import { groupCreate } from "../src/groups/groupCreate.js"
import { groupGet } from "../src/groups/groupGet.js"
import { groupLinkedParticipantList } from "../src/groups/groupLinkedParticipantList.js"
import { groupLink } from "../src/groups/groupLink.js"
import { groupSubgroupList } from "../src/groups/groupSubgroupList.js"
import { groupUnlink } from "../src/groups/groupUnlink.js"
import * as publicApi from "../src/index.js"
import { wahaClientConfig } from "../src/client/wahaClientConfig.js"

const cliPath = join(import.meta.dir, "../src/cli.ts")

type CapturedRequest = { method: string; path: string; body: unknown }

async function runCli(args: string[]) {
  const proc = Bun.spawn(["bun", "run", cliPath, ...args], { stdout: "pipe", stderr: "pipe" })
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  return { stdout, stderr, exitCode }
}

async function withMockWaha<T>(callback: (baseUrl: string, requests: CapturedRequest[]) => Promise<T>): Promise<T> {
  const requests: CapturedRequest[] = []
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      const url = new URL(request.url)
      requests.push({
        method: request.method,
        path: url.pathname + url.search,
        body: request.method === "GET" ? undefined : await request.json(),
      })
      if (url.pathname.endsWith("/subgroups")) {
        return Response.json([{ id: "1@g.us", name: "Sub", isDefaultSubGroup: false }])
      }
      if (url.pathname.endsWith("/linked-participants")) return Response.json(["1@c.us", "2@c.us"])
      if (request.method === "POST" && url.pathname.endsWith("/groups")) {
        return Response.json({ jid: "team@g.us", name: "Team", participants: [] })
      }
      return Response.json({ ok: true })
    },
  })

  try {
    return await callback(`http://127.0.0.1:${server.port}`, requests)
  } finally {
    await server.stop(true)
  }
}

describe("groupCommunityApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("groupLink POSTs the group id to the community link route", async () => {
    globalThis.fetch = mock(async () => new Response(JSON.stringify({}), { status: 200 })) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    expect(configR.success).toBe(true)
    if (!configR.success) return

    const r = await groupLink({ config: configR.data, id: "parent@g.us", groupId: "child@g.us" })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(1)
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups/parent%40g.us/link")
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({ groupId: "child@g.us" })
  })

  test("groupUnlink POSTs the group id to the community unlink route", async () => {
    globalThis.fetch = mock(async () => new Response(JSON.stringify({}), { status: 200 })) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    expect(configR.success).toBe(true)
    if (!configR.success) return

    const r = await groupUnlink({ config: configR.data, id: "parent@g.us", groupId: "child@g.us" })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(1)
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups/parent%40g.us/unlink")
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({ groupId: "child@g.us" })
  })

  test("groupSubgroupList GETs subgroups and maps id to jid", async () => {
    globalThis.fetch = mock(
      async () =>
        new Response(
          JSON.stringify([
            { id: "1@g.us", name: "Announce", isDefaultSubGroup: true },
            { id: "2@g.us", name: "General", isDefaultSubGroup: false },
          ]),
          { status: 200 },
        ),
    ) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    expect(configR.success).toBe(true)
    if (!configR.success) return

    const r = await groupSubgroupList({ config: configR.data, id: "parent@g.us" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual([
        { jid: "1@g.us", name: "Announce", isDefaultSubGroup: true },
        { jid: "2@g.us", name: "General", isDefaultSubGroup: false },
      ])
    }

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups/parent%40g.us/subgroups")
    expect(init.method).toBe("GET")
  })

  test("groupSubgroupList rejects a non-array response and invalid items", async () => {
    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    globalThis.fetch = mock(async () => new Response(JSON.stringify({}), { status: 200 })) as unknown as typeof fetch
    expect((await groupSubgroupList({ config: configR.data, id: "parent@g.us" })).success).toBe(false)

    globalThis.fetch = mock(
      async () => new Response(JSON.stringify([{ id: "1@g.us" }]), { status: 200 }),
    ) as unknown as typeof fetch
    const invalidItemR = await groupSubgroupList({ config: configR.data, id: "parent@g.us" })
    expect(invalidItemR.success).toBe(false)
  })

  test("groupLinkedParticipantList GETs linked participants", async () => {
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify(["1@c.us", "2@c.us"]), { status: 200 }),
    ) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    expect(configR.success).toBe(true)
    if (!configR.success) return

    const r = await groupLinkedParticipantList({ config: configR.data, id: "parent@g.us" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(["1@c.us", "2@c.us"])

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups/parent%40g.us/linked-participants")
    expect(init.method).toBe("GET")
  })

  test("community methods use an explicit session override", async () => {
    globalThis.fetch = mock(async () => new Response(JSON.stringify({}), { status: 200 })) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const r = await groupLink({ config: configR.data, session: "custom", id: "parent@g.us", groupId: "child@g.us" })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/custom/groups/parent%40g.us/link")
  })

  test("community methods reject invalid inputs without fetching", async () => {
    const fetchMock = mock(async () => new Response("unexpected", { status: 200 }))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const results = [
      await groupLink({ config: configR.data, id: 123, groupId: "child@g.us" } as never),
      await groupLink({ config: configR.data, id: "parent@g.us", groupId: 123 } as never),
      await groupUnlink({ config: configR.data, id: "parent@g.us", groupId: null } as never),
      await groupSubgroupList({ config: configR.data, id: 123 } as never),
      await groupLinkedParticipantList({ config: configR.data, id: null } as never),
    ]
    expect(results.every((result) => !result.success)).toBe(true)
    expect(fetchMock.mock.calls.length).toBe(0)
  })

  test("community methods reject missing session without fetching", async () => {
    const fetchMock = mock(async () => new Response("unexpected", { status: 200 }))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return

    const results = [
      await groupLink({ config: configR.data, id: "parent@g.us", groupId: "child@g.us" }),
      await groupUnlink({ config: configR.data, id: "parent@g.us", groupId: "child@g.us" }),
      await groupSubgroupList({ config: configR.data, id: "parent@g.us" }),
      await groupLinkedParticipantList({ config: configR.data, id: "parent@g.us" }),
    ]
    expect(results.every((result) => !result.success)).toBe(true)
    expect(fetchMock.mock.calls.length).toBe(0)
  })

  test("community methods are publicly exported", () => {
    expect(typeof publicApi.groupLink).toBe("function")
    expect(typeof publicApi.groupUnlink).toBe("function")
    expect(typeof publicApi.groupSubgroupList).toBe("function")
    expect(typeof publicApi.groupLinkedParticipantList).toBe("function")
  })

  test("groupCreate forwards isParent only when set", async () => {
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify({ jid: "9@g.us", name: "Community" }), { status: 200 }),
    ) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const r = await groupCreate({ config: configR.data, name: "Community", participants: [], isParent: true })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ jid: "9@g.us", name: "Community" })

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [, init] = calls[0] as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toEqual({ name: "Community", participants: [], isParent: true })
  })

  test("groupCreate forwards linkedParentId only when set", async () => {
    globalThis.fetch = mock(
      async () =>
        new Response(JSON.stringify({ jid: "9@g.us", name: "Sub", linkedParentId: "parent@g.us" }), { status: 200 }),
    ) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const r = await groupCreate({
      config: configR.data,
      name: "Sub",
      participants: [{ id: "1@c.us" }],
      linkedParentId: "parent@g.us",
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ jid: "9@g.us", name: "Sub", linkedParentId: "parent@g.us" })

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [, init] = calls[0] as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toEqual({
      name: "Sub",
      participants: [{ id: "1@c.us" }],
      linkedParentId: "parent@g.us",
    })
  })

  test("groupCreate without community fields sends the body unchanged from today", async () => {
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify({ jid: "9@g.us", name: "Team", participants: [] }), { status: 200 }),
    ) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const r = await groupCreate({ config: configR.data, name: "Team", participants: [{ id: "1@c.us" }] })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [, init] = calls[0] as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toEqual({ name: "Team", participants: [{ id: "1@c.us" }] })
  })

  test("groupCreate rejects isParent together with linkedParentId without fetching", async () => {
    const fetchMock = mock(async () => new Response("unexpected", { status: 200 }))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const r = await groupCreate({
      config: configR.data,
      name: "Both",
      participants: [],
      isParent: true,
      linkedParentId: "parent@g.us",
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("groupCreate")
    expect(fetchMock.mock.calls.length).toBe(0)
  })

  test("group normalization maps WAHA-DTO community fields", async () => {
    globalThis.fetch = mock(
      async () =>
        new Response(
          JSON.stringify({
            jid: "parent@g.us",
            name: "Community",
            isParent: true,
            linkedParentId: undefined,
            isDefaultSubGroup: false,
          }),
          { status: 200 },
        ),
    ) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return
    const r = await groupGet({ config: configR.data, id: "parent@g.us" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual({ jid: "parent@g.us", name: "Community", isParent: true, isDefaultSubGroup: false })
    }
  })

  test("group normalization maps GOWS-raw community fields", async () => {
    globalThis.fetch = mock(
      async () =>
        new Response(
          JSON.stringify({
            JID: "child@g.us",
            Name: "Sub",
            IsParent: false,
            LinkedParentJID: "parent@g.us",
            IsDefaultSubGroup: true,
          }),
          { status: 200 },
        ),
    ) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return
    const r = await groupGet({ config: configR.data, id: "child@g.us" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual({
        jid: "child@g.us",
        name: "Sub",
        isParent: false,
        linkedParentId: "parent@g.us",
        isDefaultSubGroup: true,
      })
    }
  })

  test("group normalization omits an empty GOWS LinkedParentJID", async () => {
    globalThis.fetch = mock(
      async () =>
        new Response(JSON.stringify({ JID: "plain@g.us", Name: "Plain", LinkedParentJID: "", IsAnnounce: true }), {
          status: 200,
        }),
    ) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return
    const r = await groupGet({ config: configR.data, id: "plain@g.us" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect("linkedParentId" in r.data).toBe(false)
      expect(r.data.membersCanSendMessages).toBe(true)
    }
  })

  test("groups link and unlink CLI commands forward id and groupId", async () => {
    await withMockWaha(async (baseUrl, requests) => {
      const link = await runCli([
        "groups",
        "link",
        "--baseUrl",
        baseUrl,
        "--session",
        "cli-session",
        "--id",
        "parent@g.us",
        "--groupId",
        "child@g.us",
      ])
      expect(link.exitCode).toBe(0)
      expect(requests[0]).toEqual({
        method: "POST",
        path: "/api/cli-session/groups/parent%40g.us/link",
        body: { groupId: "child@g.us" },
      })

      const unlink = await runCli([
        "groups",
        "unlink",
        "--baseUrl",
        baseUrl,
        "--session",
        "cli-session",
        "--id",
        "parent@g.us",
        "--groupId",
        "child@g.us",
      ])
      expect(unlink.exitCode).toBe(0)
      expect(requests[1]).toEqual({
        method: "POST",
        path: "/api/cli-session/groups/parent%40g.us/unlink",
        body: { groupId: "child@g.us" },
      })
    })
  })

  test("groups subgroups and linked-participants CLI commands forward the community id", async () => {
    await withMockWaha(async (baseUrl, requests) => {
      const subgroups = await runCli([
        "groups",
        "subgroups",
        "--baseUrl",
        baseUrl,
        "--session",
        "cli-session",
        "--id",
        "parent@g.us",
      ])
      expect(subgroups.exitCode).toBe(0)
      expect(requests[0]).toEqual({
        method: "GET",
        path: "/api/cli-session/groups/parent%40g.us/subgroups",
        body: undefined,
      })
      expect(subgroups.stdout).toContain("1@g.us")

      const linked = await runCli([
        "groups",
        "linked-participants",
        "--baseUrl",
        baseUrl,
        "--session",
        "cli-session",
        "--id",
        "parent@g.us",
      ])
      expect(linked.exitCode).toBe(0)
      expect(requests[1]).toEqual({
        method: "GET",
        path: "/api/cli-session/groups/parent%40g.us/linked-participants",
        body: undefined,
      })
      expect(linked.stdout).toContain("1@c.us")
    })
  })

  test("groups create CLI forwards community flags only when set", async () => {
    await withMockWaha(async (baseUrl, requests) => {
      const parent = await runCli([
        "groups",
        "create",
        "--baseUrl",
        baseUrl,
        "--session",
        "cli-session",
        "--name",
        "Community",
        "--participantsJson",
        "[]",
        "--isParent",
      ])
      expect(parent.exitCode).toBe(0)
      expect(requests[0]).toEqual({
        method: "POST",
        path: "/api/cli-session/groups",
        body: { name: "Community", participants: [], isParent: true },
      })

      const plain = await runCli([
        "groups",
        "create",
        "--baseUrl",
        baseUrl,
        "--session",
        "cli-session",
        "--name",
        "Team",
        "--participantsJson",
        "[]",
      ])
      expect(plain.exitCode).toBe(0)
      expect(requests[1]).toEqual({
        method: "POST",
        path: "/api/cli-session/groups",
        body: { name: "Team", participants: [] },
      })

      const sub = await runCli([
        "groups",
        "create",
        "--baseUrl",
        baseUrl,
        "--session",
        "cli-session",
        "--name",
        "Sub",
        "--participantsJson",
        "[]",
        "--linkedParentId",
        "parent@g.us",
      ])
      expect(sub.exitCode).toBe(0)
      expect(requests[2]).toEqual({
        method: "POST",
        path: "/api/cli-session/groups",
        body: { name: "Sub", participants: [], linkedParentId: "parent@g.us" },
      })
    })
  })
})
