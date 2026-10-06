# Production audit

Run on 2026-10-05 against the specification's final checklist. Each line states what was checked,
how, and the result. "Pass" means a mechanical check exists or the code was read line by line;
anything else is written as a limitation rather than softened.

## Automated gates

| Gate | Command | Result |
| --- | --- | --- |
| Types | `npm run typecheck` | Pass — no errors, `strict` enabled. |
| Lint | `npm run lint` | Pass — 0 errors, 0 warnings. |
| Content integrity | `npm run validate:content` | Pass — acyclic graph, no dangling references, 293/293 original topics. |
| Unit and integration tests | `npm run test` | Pass — 38 tests across 3 files. |
| Production build | `npm run build` | Pass — 24 routes compiled. |
| End-to-end routes | `npm run smoke` | Pass — 23 routes return 200/307; anonymous `/dashboard` redirects to sign-in. |

## Truthfulness

| Check | Result |
| --- | --- |
| No invented Harvard courses or requirements | Pass. Every Harvard claim traces to a source record with a retrieval date; 26 mappings each carry an evidence string copied from the page. |
| "No standalone AI Engineering bachelor's" re-verified against current pages | Pass. Re-fetched 2026-10-05 from the CS advising requirements and tag pages, not from memory. |
| Harvard College and Harvard Extension never conflated | Pass. Separate source categories, separate dossier files, separate labels in the UI. |
| CS50 never equated with the concentration | Pass. Mapped as an introductory reference point with the Fall 2026 syllabus as the source. |
| No invented job requirements or market figures | Pass. Both roles and all 56 requirements are labelled `likely_not_verified`; the Upwork fetch produced no usable data and is cited nowhere; no salary or demand figure appears anywhere. |
| No fabricated metrics, achievements, clients or reviews | Pass. Grep for fabricated-content patterns is clean; the portfolio and freelance pages state what they cannot show. |
| Provider failure shown as failure | Pass. `PuterProvider` returns `provider_unavailable` without a token; the mentor panel renders it as an error and stores it as a failed message. |
| Six source statuses never collapsed | Pass. Rendered distinctly in the UI; a test asserts `confirmed_current` requires a recorded extract. |
| Outline-only lessons declared as such | Pass. 53 of 67 lessons show an explicit banner; a test asserts authored ⇔ has blocks. |
| Auto-grading claimed only where deterministic | Pass. 5 of 45 items are `auto`; a test asserts each has a choice index or a numeric answer with tolerance. |
| Source conflicts reported, not resolved | Pass. `docs/research/conflicts.md`, including the CS 1340 / CS 1360 discrepancy. |

## Educational integrity

| Check | Result |
| --- | --- |
| Original curriculum preserved in full | Pass. 8 modules, 67 sessions, 293 topics; a test fails if any topic string disappears from the built graph. |
| One primary source label per node | Pass, asserted by test. |
| Prerequisite graph acyclic and complete | Pass, asserted by test. |
| Reading cannot produce mastery | Pass. `markContentSeen` writes only the `contentSeen` component; a test asserts the level stays `exposed`. |
| Assisted answers weighted below unaided | Pass. Six help-level weights from 1.0 to 0.1; tested. |
| Transfer and evidence required for the top level | Pass, tested. |
| Spacing shortens after a lapse or assisted recall | Pass, tested. |
| Tasks always carry a reason | Pass. `TaskDoc` requires `reasonKind` and `reasonText`; the dashboard prints the reason under every task. |
| No single "readiness percentage" | Pass. Career reporting is per requirement; a test asserts the summary exposes no percentage field. |
| No learning styles, no diagnosis language | Pass. Learning styles are listed as `speculative` and unused; the four study states describe the session and are never shown back as a judgement. |

## Security

| Check | Result |
| --- | --- |
| Secrets absent from the repository | Pass. A test scans every `.ts/.tsx/.js/.mjs/.json/.md/.css` file for connection strings, `sk-`, `ghp_`, AWS key and private-key patterns. |
| No secret behind `NEXT_PUBLIC_` | Pass, asserted by test. |
| `.env.example` holds names with empty values only | Pass, asserted by test. |
| Passwords hashed with a slow KDF | Pass. scrypt N=2¹⁷, r=8, p=1, 64-byte key, random salt, `timingSafeEqual` comparison. |
| Session tokens unguessable and not stored in clear | Pass. 32 random bytes; only the SHA-256 hash is persisted; `httpOnly`, `SameSite=Lax`, `Secure` in production, 14-day expiry with a TTL index. |
| BOLA / cross-tenant access | Pass. `owned()` injects a session-derived `ownerId` into every filter and document; tests assert a hostile `ownerId` in a payload is ignored and that one student's query returns nothing of another's. |
| Every mutation has auth, authz, schema, rate limit, logging | Pass. Enforced structurally by `action()` in `src/lib/api.ts`; all 18 mutations go through it. |
| Injection | Pass. No string-built queries; filters are structured objects in both drivers. |
| Unbounded consumption | Pass. Per-user per-action rate limits; mentor calls capped at 20 per 5 minutes; all string inputs length-bounded by schema. |
| Remote code execution | Pass by design. No student code is executed server-side, and the Practice Lab says so. |
| SSRF | Pass. The only outbound call is to the configured provider base URL; evidence URLs are stored and rendered, never fetched. |
| Prompt injection and tool abuse | Partial. Lesson context is retrieved from first-party content only, the mentor has no tools and cannot act, and failures are surfaced; but a hostile string inside a student's own question can still influence that student's own reply. Scope of harm is limited to their own thread. |
| Error messages leak nothing | Pass. Handler exceptions return a generic message; detail goes to the audit log. |
| Audit log contains no answers or secrets | Pass, by construction in `audit()`. |

## Interface

| Check | Result |
| --- | --- |
| Every screen backed by real data or a truthful empty state | Pass. Each of the 13 routes was opened signed-in with an empty account during the smoke run. |
| States covered: loading, empty, success, validation error, permission denied, not found, provider unavailable, retryable error | Pass for the implemented surfaces. Loading is server-rendered rather than skeletoned; not-found uses the framework boundary. |
| Keyboard navigation and focus visibility | Pass. Skip link on every page, visible focus ring, native controls throughout, `aria-current` on the active nav item. |
| Colour never the only signal | Pass. Every status chip carries a word. |
| Reduced motion respected | Pass. Both the OS preference and the in-app setting. |
| No decorative AI imagery, gradients or fake analytics | Pass. No images at all; the only chart is a review forecast drawn from the student's own schedule, with a text alternative. |

## Known limitations

These are real and are stated in the product, not hidden:

1. **MongoDB is not running in this environment.** The Mongo driver is complete, but with no
   `MONGODB_URI` the app uses a file-backed store. The Settings and Admin pages name the live
   driver.
2. **53 of 67 lessons are outlines.** Topics, objectives, prerequisites and mastery criteria are
   real; the prose is not written. Each such lesson says so.
3. **48 lessons have no assessment items.** The lesson page says so instead of generating a quiz.
4. **Ladder levels 8 and 10 have no project.** Shown as empty levels, not padded.
5. **GitHub OAuth, object storage and the search provider are not implemented.** Reserved
   environment variables, reported as unconfigured at `/admin` and `/api/health`.
6. **Evidence verification is manual by design.** Nothing is auto-verified, so a new account shows
   zero CV-eligible items until a human review happens.
7. **No accessibility audit by an external tool.** The checks above were done by reading the markup
   and keyboard-testing the flows; no axe or screen-reader pass was run.
8. **Rate limiting is in-process.** Correct for a single instance; a shared store would be required
   behind multiple instances.
