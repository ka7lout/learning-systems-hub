# Source conflicts

Recorded, not resolved. Where two official pages disagree, guessing an answer would be fabrication.

## 1. Formal Reasoning course number

- **`src-harvard-cs-requirements`** lists **CS 1340** under the Formal Reasoning requirement.
- **`src-harvard-cs-tags`** lists **CS 1360 — Economics and Computation** in the corresponding tag
  table.

Both pages are official Harvard CS advising pages, retrieved on the same date. The discrepancy may
be a renumbering in progress, a stale table, or two different courses that both satisfy the
requirement. **No resolution is asserted.** Any student using this mapping to plan actual enrolment
is directed to the advising pages themselves.

## 2. "Data Science graduate program" URL

- The historical URL `extension.harvard.edu/academics/programs/data-science-graduate-program/`
  redirects to `…/data-science-artificial-intelligence-graduate-program/`.

This is a redirect rather than a contradiction, but it is recorded because any citation using the
old URL is now unverifiable at that address. The new URL is the one stored.

## 3. BLS figure attribution

- A Harvard Extension page states +34% growth in data scientist jobs by 2034 and attributes it to
  the US Bureau of Labor Statistics.
- The BLS publication itself was not retrieved in this pass.

Recorded as a second-hand attribution with status `likely_not_verified`. It is not displayed in the
product as a labour-market fact.

## 4. Provider marketing versus deployment reality

- The Puter developer blog describes DeepSeek V4 access as requiring no API key.
- This deployment still requires a server-side `PUTER_AUTH_TOKEN`, because a browser-held credential
  would be a secret in client code.

Not a factual conflict, but a conflict between vendor framing and the security rules this project
operates under. The project's rule wins, and the mentor returns a truthful "provider unavailable"
state when the token is absent.
