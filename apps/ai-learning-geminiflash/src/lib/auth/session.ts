import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: "student" | "admin" | "content_editor" | "reviewer" | "research_editor" | "career_editor";
  statePreference: "deep" | "drift" | "fog" | "overload";
  englishMode: "standard_tech" | "b1_b2" | "arabic_assisted" | "training_mode";
  targetRoleId: string;
}

const DEFAULT_USER_ID = "usr-learner-primary";

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  await ensureDbInitialized();

  // Inspect session cookie
  const cookieStore = await cookies();
  const preferredUserId = cookieStore.get("ihls_active_user")?.value || DEFAULT_USER_ID;

  try {
    const userRows = await db.select().from(users).where(eq(users.id, preferredUserId)).limit(1);
    const userRow = userRows[0];

    if (userRow) {
      return {
        id: userRow.id,
        email: userRow.email,
        name: userRow.name,
        role: (userRow.role as AuthenticatedUser["role"]) || "student",
        statePreference: (userRow.statePreference as AuthenticatedUser["statePreference"]) || "deep",
        englishMode: (userRow.englishMode as AuthenticatedUser["englishMode"]) || "standard_tech",
        targetRoleId: userRow.targetRoleId || "navisoft_ai_engineer"
      };
    }
  } catch (err) {
    console.error("Error retrieving user session:", err);
  }

  // Safe fallback default
  return {
    id: DEFAULT_USER_ID,
    email: "learner@ismaili-harvard.edu",
    name: "Ismaili Scholar",
    role: "student",
    statePreference: "deep",
    englishMode: "standard_tech",
    targetRoleId: "navisoft_ai_engineer"
  };
}

export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Session missing or expired.");
  }
  return user;
}
