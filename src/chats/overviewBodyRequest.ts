import type { OverviewFilter } from "./overviewFilter.js"

export type OverviewBodyRequest = {
  pagination: {
    limit?: number
    offset?: number
    merge?: boolean
  }
  filter?: OverviewFilter
}
