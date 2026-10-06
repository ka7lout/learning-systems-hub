# Harvard Extension School — findings

Retrieved 2026-10-05. Source ids refer to `source-register.md`.

## Separate institution, separate credential

Harvard Extension School is part of Harvard University but is **not** Harvard College. It has its
own admissions model, its own course numbering (the `S-` and `E-` prefixes), its own certificates
and degrees, and its own catalogue. Conflating the two is the single most common misrepresentation
in curricula that claim a Harvard lineage, and this project treats it as a correctness bug.

Every Extension-derived node in the curriculum carries the source label **Harvard Extension**, never
"Harvard College" and never the bare word "Harvard".

## Artificial Intelligence Graduate Certificate

From `src-harvard-ext-ai-cert`:

- A graduate certificate programme composed of a small number of graduate-level courses.
- Courses taken before academic year 2023–24 do not count toward the certificate.
- Named instructors on the page at retrieval: Bruce Huang, Stephen Elston, Oleg Pianykh.

## Data Science and Artificial Intelligence graduate programme

From `src-harvard-ext-dsai`:

- The older `data-science-graduate-program` URL now redirects to the combined
  `data-science-artificial-intelligence-graduate-program` page. The old URL is stale and is not used
  as a citation.
- The programme is described as stackable with the AI and Data Science graduate certificates.
- The page cites a projection of **+34% growth in data scientist jobs by 2034**, attributed to the
  US Bureau of Labor Statistics.

**Important handling of that figure:** it is recorded as *Harvard Extension quoting BLS*, with the
status `likely_not_verified`, because the BLS publication itself was not fetched in this pass. It is
not presented anywhere in the product as a verified labour-market fact.

## Use in this curriculum

Extension material informs the applied, professional end of the curriculum: deployment practice,
data engineering workflow and the framing of AI work as an engineering discipline rather than a
research activity. It is mapped, labelled and dated, exactly like the College material.
