# Hosting DFLY Packs

Digital Fly is a static browser application. It can load a converted DFLY pack from a separate static host, but the host must be configured for cross-origin browser access and should support byte ranges for large binary objects.

## Required Response Behavior

| Requirement | Reason |
|---|---|
| `Access-Control-Allow-Origin` allowing the Digital Fly origin | The browser must be permitted to retrieve `manifest.json` and binary chunks. |
| `Content-Type: application/json` for the manifest | Makes manifest delivery debuggable and interoperable. |
| `Accept-Ranges: bytes` and correct `206 Partial Content` responses | Enables future selective chunk/range acquisition. The current loader also accepts full chunk responses. |
| Immutable filenames or cache-busted release paths | Prevents a cached manifest from being paired with rewritten chunks. |
| HTTPS | Required for reliable browser storage and Web Crypto in deployed contexts. |

The manifest is the only entry URL configured in the application. Chunks may contain relative `path` values, which resolve relative to that manifest, or explicit `url` values. Each downloaded chunk must match the SHA-256 declared by the manifest before the browser writes it to IndexedDB.

## Cloudflare R2 Example

Place one converted output directory under a versioned R2 prefix such as `flywire/v783/dfly-transform-1/`. Expose it through a public custom domain or a constrained Worker that only serves immutable GET and Range requests. Do not add an API that modifies the pack, and do not remove the FlyWire release/citation material from `manifest.json`.

```text
https://data.example.org/flywire/v783/dfly-transform-1/manifest.json
https://data.example.org/flywire/v783/dfly-transform-1/chunks/source_index-00000.bin
```

Use origin rules that allow the deployed Digital Fly domain and local development origin. If public distribution is not appropriate for the data-use context, use a private research-hosting arrangement with authenticated retrieval instead; the static browser app will then need an approved, secure access approach rather than embedding a secret in frontend code.

## Verification Workflow

After hosting, open Digital Fly and select **VERIFY PACK**. The application validates the DFLY contract, source provenance, citations, declared data sizes, SHA-256 syntax, and a conservative device-memory budget. A `BLOCKED` result is a safety outcome, not a loader failure. Only when status is `VALIDATED` should you use **CACHE**. `CACHED` means all declared chunks passed hash verification and are available locally; it does not mean the current neural engine is executing a full FlyWire model.

## Prohibited Shortcuts

Do not commit transformed connectivity chunks to the source repository. Do not put source credentials, signed URLs with long-lived secrets, or access tokens in frontend code. Do not change a manifest’s release/citation fields manually to make arbitrary files appear FlyWire-derived. Do not represent the current synthetic fixture as data loaded from a verified pack.
