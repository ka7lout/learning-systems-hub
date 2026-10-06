# SECURITY & MULTI-TENANT ISOLATION ARCHITECTURE
**Compliance Target:** OWASP Top 10 API Security (2023) & OWASP Top 10 for LLMs (2025/2026)

---

## 1. Multi-Student Data Isolation
- **Rule:** Every private resource query MUST be strictly parameterized by a server-derived `ownerId` extracted from the cryptographically verified session token.
- **Client Identifier Disregard:** Any client-supplied `userId`, `ownerId`, or `studentId` in request bodies or query params is rejected or ignored.
- **Isolation Scope:** Student progress, custom learning notes, AI conversation logs, oral viva audio recordings, code submissions, and career gap assessments cannot be accessed cross-tenant under any condition.

## 2. LLM Instruction Hierarchy & Untrusted Content Handling
- **Instruction Priority Order:**
  1. `System Policy`: System core constraints, safety boundaries, and pedagogical behavior protocols.
  2. `Application Policy`: Course-specific and specialist persona bounds.
  3. `User Request`: Authenticated student input.
  4. `Retrieved Knowledge / User Artifacts`: Untrusted data treated purely as reference context.
- **Prompt Injection Defense:** External documents, user code, or retrieved web pages are enclosed in strict XML delimiters `<untrusted_content>` and explicitly stripped of meta-instruction bypasses.

## 3. Remote Code Execution Boundary
- **Vercel Server Protection:** Arbitrary student code is NEVER executed on the platform server.
- **Safe Execution Models:**
  - Fast client-side JavaScript / WebAssembly execution for basic tasks.
  - Interactive SQL client against local in-memory SQL engines / simulated schema instances.
  - Guided external execution for heavy ML/DL workloads via deep links to GitHub Codespaces, Google Colab, and Kaggle environments with automated test harnesses.

## 4. Secret Management
- **Zero Secrets in Public Bundles:** All API keys (`PUTER_AUTH_TOKEN`, `DATABASE_URL`, `AUTH_SECRET`) are server-only environment variables.
- **Truthful Failure Reporting:** If a 3rd party AI or search provider is offline or missing credentials, the system presents a graceful fallback state with informative diagnostic hints rather than fabricated success.
