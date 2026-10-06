# Testing

## Required verification

From the project root, run:

```bash
bash -lc 'set -o pipefail; npx next typegen 2>&1 | tee /tmp/next-typegen.log'
bash -lc 'set -o pipefail; npm exec tsc -- --noEmit --pretty false 2>&1 | tee /tmp/tsc.log'
bash -lc 'set -o pipefail; npm run build 2>&1 | tee /tmp/build.log'
```

Then use the managed `build_and_start` healthcheck. Do not use `next start` directly as final validation.

## Release test plan

- Unit: source-status handling, curriculum completeness and DAG cycle rejection, mastery/review scheduling, help-level policy, role-gap mapping, output schemas.
- Integration: Drizzle seed idempotency, auth session flow, assessment persistence, project/evidence creation, provider failure and configured provider mapping.
- Authorization: unauthenticated reads/mutations denied; student A cannot read/update/delete student B projects, progress, conversations, profile or evidence; role/property allowlists.
- API/security: malformed and oversized input, rate limits, SSRF-resistant source handling, prompt-injection content boundaries, no code execution, errors do not expose secrets.
- E2E: account creation/sign-in; select learning state; study; attempt; feedback; persist recall/transfer; schedule review; create project; attach evidence; inspect skill gap; complete technical-English exercise; provider-unavailable fallback.

No test fixture, synthetic user, mock career result or seeded curriculum record should be shown as a genuine student achievement. Automated coverage must be added and run before describing these flows as production audited.
