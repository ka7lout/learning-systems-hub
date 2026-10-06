# Content model

## Curriculum node

`id`, `parentId`, `title`, `kind`, `sourceCategory`, `status`, `level`, `description`, `topics`, `objectives`, `prerequisites`, `masteryCriteria`, `estimatedHours`, `sequence`, timestamps.

A node is published only when objectives, prerequisites, mastery criteria, assessment, and source/ownership decisions exist. This build seeds module-level records; lesson/block CMS records are the next expansion.

## Mastery evidence

Completion, recall, transfer, implementation, and delayed retention are separate fields. Video or page viewing cannot mark competence. Practice submissions record task type, response, score, help level, independent/assisted status, feedback, and time.

## Source status

`confirmed_current`, `confirmed_historical`, `likely_not_verified`, `not_found`, `design_decision`, and `research_hypothesis` are never collapsed. Source categories are also distinct and include Original Curriculum, Harvard College, Harvard Extension, Industry Extension, and Research Extension.

## Content rules

Original topics and project titles are preserved. Duplicate coverage should become a depth layer—practical, statistical, mathematical, theoretical, case, and implementation—not five copies of the same lesson. Technical English is attached to actual engineering contexts rather than vocabulary counts.
