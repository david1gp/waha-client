import { describe, expect, test } from "bun:test"
import { PACKAGE_VERSION, wahaClientConfig } from "../src/index.js"

describe("smoke", () => {
  test("PACKAGE_VERSION is set", () => {
    expect(PACKAGE_VERSION).toBe("0.1.0")
  })

  test("wahaClientConfig accepts valid config", () => {
    const r = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      apiKey: "secret",
      session: "default",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.baseUrl).toBe("http://localhost:3000")
      expect(r.data.apiKey).toBe("secret")
      expect(r.data.session).toBe("default")
    }
  })

  test("wahaClientConfig rejects empty baseUrl", () => {
    const r = wahaClientConfig({ baseUrl: "" })
    expect(r.success).toBe(false)
  })
})
