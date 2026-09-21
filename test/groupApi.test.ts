import { afterEach, describe, expect, mock, test } from "bun:test"
import { groupCreate } from "../src/groupCreate.js"
import { groupGet } from "../src/groupGet.js"
import { groupJoinInfoGet } from "../src/groupJoinInfoGet.js"
import { groupList } from "../src/groupList.js"
import { groupMemberAddModeGet } from "../src/groupMemberAddModeGet.js"
import { groupMemberAddModeSet } from "../src/groupMemberAddModeSet.js"
import { groupMembershipApprovalGet } from "../src/groupMembershipApprovalGet.js"
import { groupMembershipApprovalSet } from "../src/groupMembershipApprovalSet.js"
import { groupParticipantJoinRequestApprove } from "../src/groupParticipantJoinRequestApprove.js"
import { groupParticipantJoinRequestList } from "../src/groupParticipantJoinRequestList.js"
import { groupParticipantJoinRequestReject } from "../src/groupParticipantJoinRequestReject.js"
import type { GroupInfo } from "../src/groupTypes.js"
import * as publicApi from "../src/index.js"
import { wahaClientConfig } from "../src/wahaClientConfig.js"

describe("groupApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("groupList GET /api/{session}/groups with query", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ id: "1@g.us", subject: "G" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      apiKey: "k",
      session: "default",
    })
    expect(configR.success).toBe(true)
    if (!configR.success) return

    const r = await groupList({
      config: configR.data,
      limit: 10,
      sortBy: "subject",
      exclude: ["participants"],
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual([{ jid: "1@g.us", name: "G" }])
    }

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(1)
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups?limit=10&sortBy=subject&exclude=participants")
    expect(init.method).toBe("GET")
    expect((init.headers as Record<string, string>)["X-Api-Key"]).toBe("k")
  })

  test("groupCreate POST body", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ jid: "9@g.us", name: "Team", participants: [] }), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      session: "default",
    })
    if (!configR.success) return

    const r = await groupCreate({
      config: configR.data,
      name: "Team",
      participants: [{ id: "1@c.us" }],
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual({ jid: "9@g.us", name: "Team", participants: [] })
    }

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups")
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({
      name: "Team",
      participants: [{ id: "1@c.us" }],
    })
  })

  test("group responses normalize GOWS fields for all four group info methods", async () => {
    const gowsGroup = {
      JID: "123@g.us",
      OwnerJID: "456@s.whatsapp.net",
      Name: "GOWS group",
      Topic: "Group description",
      IsLocked: false,
      IsAnnounce: true,
      Participants: [
        {
          JID: "111@s.whatsapp.net",
          PhoneNumber: "111@s.whatsapp.net",
          IsAdmin: false,
          IsSuperAdmin: false,
        },
        {
          JID: "222:3@s.whatsapp.net",
          PhoneNumber: "222:3@s.whatsapp.net",
          IsAdmin: true,
          IsSuperAdmin: false,
        },
        {
          JID: "333@lid",
          PhoneNumber: "333@lid",
          IsAdmin: true,
          IsSuperAdmin: true,
        },
      ],
      MemberAddMode: "all_member_add",
      IsJoinApprovalRequired: true,
    }
    const expected: GroupInfo = {
      jid: "123@g.us",
      name: "GOWS group",
      description: "Group description",
      participants: [
        { id: "111@c.us", pn: "111@c.us", role: "participant" },
        { id: "222@c.us", pn: "222@c.us", role: "admin" },
        { id: "333@lid", pn: "333@lid", role: "superadmin" },
      ],
      membersCanAddNewMember: true,
      membersCanSendMessages: true,
      newMembersApprovalRequired: true,
    }

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return
    const responses = [
      { call: () => groupList({ config: configR.data }), url: "http://localhost:3000/api/default/groups" },
      {
        call: () => groupGet({ config: configR.data, id: "123@g.us" }),
        url: "http://localhost:3000/api/default/groups/123%40g.us",
      },
      {
        call: () => groupCreate({ config: configR.data, name: "GOWS group", participants: [] }),
        url: "http://localhost:3000/api/default/groups",
      },
      {
        call: () => groupJoinInfoGet({ config: configR.data, code: "invite" }),
        url: "http://localhost:3000/api/default/groups/join-info?code=invite",
      },
    ]

    for (const [index, response] of responses.entries()) {
      globalThis.fetch = mock(
        async () => new Response(JSON.stringify(index === 0 ? [gowsGroup] : gowsGroup), { status: 200 }),
      ) as unknown as typeof fetch
      const r = await response.call()
      expect(r.success).toBe(true)
      if (r.success) expect(Array.isArray(r.data) ? r.data[0] : r.data).toEqual(expected)
      const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
      expect((calls[0] as [string, RequestInit])[0]).toBe(response.url)
    }
  })

  test("group response normalization preserves canonical empty identity fields and accepts legacy fields", async () => {
    globalThis.fetch = mock(
      async () =>
        new Response(JSON.stringify({ jid: "", id: "fallback@g.us", name: "", subject: "Fallback" }), { status: 200 }),
    ) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return
    const r = await groupGet({ config: configR.data, id: "123@g.us" })
    expect(r).toEqual({ success: true, data: { jid: "", name: "" } })
  })

  test("group response normalization rejects invalid identity fields and list items", async () => {
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify({ JID: 123, Name: "Invalid" }), { status: 200 }),
    ) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return
    const invalidSingleR = await groupGet({ config: configR.data, id: "123@g.us" })
    expect(invalidSingleR.success).toBe(false)

    globalThis.fetch = mock(
      async () =>
        new Response(JSON.stringify([{ JID: "123@g.us", Name: "Valid" }, { JID: "456@g.us" }]), { status: 200 }),
    ) as unknown as typeof fetch
    const invalidListR = await groupList({ config: configR.data })
    expect(invalidListR.success).toBe(false)
  })

  test("groupList errors when session missing", async () => {
    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return
    const r = await groupList({ config: configR.data })
    expect(r.success).toBe(false)
  })

  test("groupMemberAddModeGet GET endpoint and response data", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ membersCanAddNewMember: false }), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const r = await groupMemberAddModeGet({ config: configR.data, id: "123@g.us" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ membersCanAddNewMember: false })

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups/123%40g.us/settings/security/member-add-mode")
    expect(init.method).toBe("GET")
  })

  test("groupMemberAddModeSet PUT sends both boolean values and maps response data", async () => {
    globalThis.fetch = mock(async (_url, init) => {
      const body = JSON.parse(init?.body as string) as { membersCanAddNewMember: boolean }
      return new Response(JSON.stringify(body.membersCanAddNewMember), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const trueR = await groupMemberAddModeSet({
      config: configR.data,
      id: "123@g.us",
      membersCanAddNewMember: true,
    })
    const falseR = await groupMemberAddModeSet({
      config: configR.data,
      id: "123@g.us",
      membersCanAddNewMember: false,
    })
    expect(trueR).toEqual({ success: true, data: true })
    expect(falseR).toEqual({ success: true, data: false })

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(2)
    for (const call of calls) {
      const [url, init] = call as [string, RequestInit]
      expect(url).toBe("http://localhost:3000/api/default/groups/123%40g.us/settings/security/member-add-mode")
      expect(init.method).toBe("PUT")
    }
    expect(JSON.parse((calls[0] as [string, RequestInit])[1].body as string)).toEqual({
      membersCanAddNewMember: true,
    })
    expect(JSON.parse((calls[1] as [string, RequestInit])[1].body as string)).toEqual({
      membersCanAddNewMember: false,
    })
  })

  test("groupMembershipApprovalGet GET endpoint and response data", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ newMembersApprovalRequired: true }), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const r = await groupMembershipApprovalGet({ config: configR.data, id: "123@g.us" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ newMembersApprovalRequired: true })

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups/123%40g.us/settings/security/membership-approval")
    expect(init.method).toBe("GET")
  })

  test("groupMembershipApprovalSet PUT sends both boolean values and maps response data", async () => {
    globalThis.fetch = mock(async (_url, init) => {
      const body = JSON.parse(init?.body as string) as { newMembersApprovalRequired: boolean }
      return new Response(JSON.stringify(body.newMembersApprovalRequired), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const trueR = await groupMembershipApprovalSet({
      config: configR.data,
      id: "123@g.us",
      newMembersApprovalRequired: true,
    })
    const falseR = await groupMembershipApprovalSet({
      config: configR.data,
      id: "123@g.us",
      newMembersApprovalRequired: false,
    })
    expect(trueR).toEqual({ success: true, data: true })
    expect(falseR).toEqual({ success: true, data: false })

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(2)
    for (const call of calls) {
      const [url, init] = call as [string, RequestInit]
      expect(url).toBe("http://localhost:3000/api/default/groups/123%40g.us/settings/security/membership-approval")
      expect(init.method).toBe("PUT")
    }
    expect(JSON.parse((calls[0] as [string, RequestInit])[1].body as string)).toEqual({
      newMembersApprovalRequired: true,
    })
    expect(JSON.parse((calls[1] as [string, RequestInit])[1].body as string)).toEqual({
      newMembersApprovalRequired: false,
    })
  })

  test("groupParticipantJoinRequestList GET endpoint and maps nullable response fields", async () => {
    const response = [
      {
        requesterId: "111@c.us",
        requesterPn: null,
        addedById: "222@c.us",
        parentGroupId: null,
        requestMethod: "invite",
        timestamp: 1700000000,
      },
    ]
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify(response), { status: 200 }),
    ) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const r = await groupParticipantJoinRequestList({ config: configR.data, id: "123@g.us" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(response)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups/123%40g.us/participants/join-requests")
    expect(init.method).toBe("GET")
  })

  test("groupParticipantJoinRequestApprove POST sends exact participants body and maps response", async () => {
    const response = [{ requesterId: "111@c.us", success: true }]
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify(response), { status: 200 }),
    ) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return
    const participants = [{ id: "111@c.us" }, { id: "222@c.us" }]

    const r = await groupParticipantJoinRequestApprove({ config: configR.data, id: "123@g.us", participants })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(response)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups/123%40g.us/participants/join-requests/approve")
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({ participants })
  })

  test("groupParticipantJoinRequestReject POST sends exact participants body and maps response", async () => {
    const response = [{ requesterId: "111@c.us", success: false, error: 403 }]
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify(response), { status: 200 }),
    ) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return
    const participants = [{ id: "111@c.us" }]

    const r = await groupParticipantJoinRequestReject({ config: configR.data, id: "123@g.us", participants })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(response)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups/123%40g.us/participants/join-requests/reject")
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({ participants })
  })

  test("group membership methods use an explicit session override", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ membersCanAddNewMember: true }), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const r = await groupMemberAddModeGet({ config: configR.data, session: "custom", id: "123@g.us" })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/custom/groups/123%40g.us/settings/security/member-add-mode")
  })

  test("group membership methods reject invalid inputs without fetching", async () => {
    const fetchMock = mock(async () => new Response("unexpected", { status: 200 }))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const results = [
      await groupMemberAddModeGet({ config: configR.data, id: 123 } as never),
      await groupMemberAddModeSet({ config: configR.data, id: "123@g.us", membersCanAddNewMember: "false" } as never),
      await groupMembershipApprovalGet({ config: configR.data, id: 123 } as never),
      await groupMembershipApprovalSet({
        config: configR.data,
        id: "123@g.us",
        newMembersApprovalRequired: 0,
      } as never),
      await groupParticipantJoinRequestList({ config: configR.data, id: null } as never),
      await groupParticipantJoinRequestApprove({
        config: configR.data,
        id: "123@g.us",
        participants: [{ id: 1 }],
      } as never),
      await groupParticipantJoinRequestReject({
        config: configR.data,
        id: "123@g.us",
        participants: "invalid",
      } as never),
    ]
    expect(results.every((result) => !result.success)).toBe(true)
    expect(fetchMock.mock.calls.length).toBe(0)
  })

  test("group membership methods reject missing session without fetching", async () => {
    const fetchMock = mock(async () => new Response("unexpected", { status: 200 }))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return

    const results = [
      await groupMemberAddModeGet({ config: configR.data, id: "123@g.us" }),
      await groupMemberAddModeSet({ config: configR.data, id: "123@g.us", membersCanAddNewMember: true }),
      await groupMembershipApprovalGet({ config: configR.data, id: "123@g.us" }),
      await groupMembershipApprovalSet({ config: configR.data, id: "123@g.us", newMembersApprovalRequired: false }),
      await groupParticipantJoinRequestList({ config: configR.data, id: "123@g.us" }),
      await groupParticipantJoinRequestApprove({ config: configR.data, id: "123@g.us", participants: [] }),
      await groupParticipantJoinRequestReject({ config: configR.data, id: "123@g.us", participants: [] }),
    ]
    expect(results.every((result) => !result.success)).toBe(true)
    expect(fetchMock.mock.calls.length).toBe(0)
  })

  test("group membership methods are publicly exported", () => {
    expect(typeof publicApi.groupMemberAddModeGet).toBe("function")
    expect(typeof publicApi.groupMemberAddModeSet).toBe("function")
    expect(typeof publicApi.groupMembershipApprovalGet).toBe("function")
    expect(typeof publicApi.groupMembershipApprovalSet).toBe("function")
    expect(typeof publicApi.groupParticipantJoinRequestList).toBe("function")
    expect(typeof publicApi.groupParticipantJoinRequestApprove).toBe("function")
    expect(typeof publicApi.groupParticipantJoinRequestReject).toBe("function")
  })
})
