import "server-only";
import type { Role, Session } from "./session";

/** §191 — least privilege. Permissions are explicit; roles are bundles of them. */
export const PERMISSIONS = [
  "curriculum:read",
  "curriculum:write",
  "own:read",
  "own:write",
  "assessment:review",
  "research:write",
  "career:write",
  "admin:read",
  "admin:write",
  "audit:read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  student: ["curriculum:read", "own:read", "own:write"],
  content_editor: ["curriculum:read", "curriculum:write", "own:read", "own:write"],
  reviewer: ["curriculum:read", "own:read", "own:write", "assessment:review"],
  research_editor: ["curriculum:read", "own:read", "own:write", "research:write"],
  career_editor: ["curriculum:read", "own:read", "own:write", "career:write"],
  support: ["curriculum:read", "own:read", "own:write", "admin:read"],
  admin: [...PERMISSIONS],
};

export function permissionsFor(roles: Role[]): Set<Permission> {
  const out = new Set<Permission>();
  for (const role of roles) for (const p of ROLE_PERMISSIONS[role] ?? []) out.add(p);
  return out;
}

export function can(session: Session | null, permission: Permission): boolean {
  if (!session) return false;
  return permissionsFor(session.roles).has(permission);
}

export function requirePermission(session: Session | null, permission: Permission): asserts session is Session {
  if (!can(session, permission)) {
    const error = new Error("FORBIDDEN") as Error & { status?: number };
    error.status = 403;
    throw error;
  }
}
