import "server-only";
import { redirect } from "next/navigation";
import { getSession, type Session } from "./session";

/**
 * Session accessor for server components. A missing session is a redirect to
 * sign-in, not an exception — throwing would surface as an error page for the
 * ordinary case of a signed-out visitor.
 */
export async function pageSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
