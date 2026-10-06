import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { PageHeader, Section } from "@/components/ui";
import { FreelanceSim } from "@/components/client";

export default async function Freelance() {
  await requireUser();
  return (
    <>
      <PageHeader title="Freelance studio" lead="Practise the professional loop: discovery → requirements → scope → acceptance criteria → estimate → proposal → change requests → delivery → maintenance. Clients here are clearly labelled simulations." />
      <Section title="Client discovery simulation"><FreelanceSim /></Section>
      <Section title="Learn the foundations"><p className="text-sm">Study <Link href="/learn/ix-freelance" className="text-accent underline">Freelancing for AI Engineers</Link> for scoping and proposal practice, and <Link href="/learn/ix-agents" className="text-accent underline">RAG, GraphRAG & Agent Engineering</Link> to scope chatbot work honestly.</p></Section>
    </>
  );
}
