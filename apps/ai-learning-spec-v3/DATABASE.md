# Database

The supplied runtime is PostgreSQL with Drizzle ORM, so this build uses PostgreSQL as the source of truth rather than silently introducing MongoDB. The schema is intentionally adapter-friendly: curriculum metadata, learner state, assessments, reviews, projects, evidence, roles, and source snapshots are relational records.

Core tables include learners, curriculum_nodes, skills, projects, project_milestones, learning_sessions, assessment_submissions, mastery_records, review_items, sources, mentor_threads/messages, career_roles, english_terms, and later_items.

Run `npx drizzle-kit push` after schema changes. Production should add foreign keys, indexes for every owner-scoped query, migrations, backup policy, and authenticated DAL checks. Object storage belongs outside the database for large artifacts; GitHub remains the code source of truth.
