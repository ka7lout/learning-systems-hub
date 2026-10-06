import { getCurrentUser } from "@/lib/auth";
import { getReviewQueue, getConceptTitle } from "@/lib/queries";
import { redirect } from "next/navigation";
import ReviewSession from "../_components/ReviewSession";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const due = await getReviewQueue(user.id, 30);
  const items = await Promise.all(
    due.map(async (d) => ({
      id: d.id,
      conceptTitle: await getConceptTitle(d.conceptId),
      confidence: d.confidence,
      lastReviewed: d.lastReviewed ? d.lastReviewed.toISOString() : null,
      nextReview: d.nextReview ? d.nextReview.toISOString() : null,
    })),
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Review queue</h1>
        <p className="muted mt-1 text-sm">
          Only concepts actually due appear here. Retrieval strengthens memory far more than rereading.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="surface-2 p-4 text-sm muted">Your review queue is empty.</p>
      ) : (
        <ReviewSession items={items} />
      )}
    </div>
  );
}
