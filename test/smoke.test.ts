import { describe, expect, test } from "bun:test"
import pkg from "../package.json" with { type: "json" }
import { PACKAGE_VERSION, packageVersion, wahaClientConfig } from "../src/index.js"

describe("smoke", () => {
  test("PACKAGE_VERSION is set", () => {
    expect(PACKAGE_VERSION).toBe(pkg.version)
    expect(packageVersion).toBe(pkg.version)
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
