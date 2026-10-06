import { NextResponse } from "next/server";
import { describeStorage } from "@/lib/db";
import { buildCurriculumGraph, validateGraph, CONTENT_VERSION } from "@/content";

export const dynamic = "force-dynamic";

/**
 * GET /api/health — unauthenticated liveness and configuration truth.
 * Reports which capabilities are configured. It never claims a provider works
 * when its credentials are absent.
 */
export async function GET() {
  const storage = describeStorage();
  const validation = validateGraph(buildCurriculumGraph());
  return NextResponse.json({
    ok: validation.ok,
    contentVersion: CONTENT_VERSION,
    storage: { kind: storage.kind, configured: storage.configured },
    capabilities: {
      aiMentor: Boolean(process.env.PUTER_AUTH_TOKEN),
      githubOAuth: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      objectStorage: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      search: Boolean(process.env.SEARCH_API_KEY),
    },
    content: validation.stats,
  });
}
