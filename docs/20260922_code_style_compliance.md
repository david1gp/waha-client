# Code-style compliance

## Goal
Make the project comply with the installed code-style skill. Breaking imports are allowed. Preserve functional API and CLI behavior; no compatibility shims or unrelated features.

## Decisions
- Use existing dependencies and read the code-style skill before implementation.
- Keep valid subject-first names. Each exported declaration belongs in its named file; schema-derived types may remain with their schema. Package entrypoints and framework-required exports are exceptions.
- Organize source by bounded context. Domain CLI adapters belong within their domain context, not a separate domain tree under cli. CLI bootstrap/configuration may remain in a cli context.
- Split type/schema/helper buckets; do not introduce replacement buckets or compatibility barrels.
- Preserve the intentional package root entrypoint and binary; update subpath exports, imports, tests and documentation to the new layout.
- Apply Result/error requirements using existing result dependencies; confirm their actual contract before changes.
- Do not modify the pre-existing user change in docs/20260921_group_jid_name.md.

## Approach and tasks
1. Split multi-export source implementations and type/schema buckets into named files; update imports and root exports. Keep layout otherwise stable. Verify typecheck and tests.
2. Move source into bounded contexts and colocate domain CLI adapters within their contexts. Update package/build paths, tests and active documentation. Verify typecheck, tests and build.
3. Audit and correct remaining skill requirements, particularly fallible boundaries and API error design, with focused tests. Do not apply server-only requirements blindly to this client.
4. Independently audit final compliance and run typecheck, tests, build and CLI smoke checks; fix confirmed remaining violations.

## Status
- Task 1: completed.
- Task 2: completed.
- Task 3: completed.
- Task 4: completed.

## Current context
- Export buckets have been split; schema-derived types remain with schemas. No TSX.
- Source is organized by bounded context, with domain CLI adapters inside their owning contexts and shared transport in client.
- Request preparation and invalid-config handling preserve Result boundaries for serialization failures. Server response error catalogs do not apply to this HTTP client.
- Endpoint validation errors no longer serialize arbitrary error context; exported WebSocket observation factory filename matches its declaration.
- Public root entrypoint is src/index.ts; binary builds to dist/cli.js.
