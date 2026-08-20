import pkg from "../package.json" with { type: "json" }

export const packageVersion = pkg.version
export const PACKAGE_VERSION = pkg.version
