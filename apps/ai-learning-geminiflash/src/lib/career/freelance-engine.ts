export interface FreelanceScenario {
  slug: string;
  clientName: string;
  clientRole: string;
  companyType: string;
  initialBrief: string;
  hiddenConstraints: {
    budgetRange: string;
    timelineWeeks: number;
    securityRequirement: string;
    dataVolume: string;
  };
  evaluationCriteria: string[];
}

export const FREELANCE_SCENARIOS: FreelanceScenario[] = [
  {
    slug: "fintech-rag-assistant",
    clientName: "David Sterling",
    clientRole: "VP of Digital Operations",
    companyType: "Mid-sized FinTech Wealth Management",
    initialBrief: "We need an internal AI assistant to help our 120 compliance analysts search through 50,000 regulatory PDF filings quickly.",
    hiddenConstraints: {
      budgetRange: "$15,000 - $25,000 USD",
      timelineWeeks: 6,
      securityRequirement: "Data MUST NOT be sent to public 3rd-party model endpoints without enterprise zero-data-retention agreements; must run in client's AWS VPC.",
      dataVolume: "50,000 multi-page PDF documents updated weekly with OCR tables."
    },
    evaluationCriteria: [
      "Asked about document freshness and weekly update frequencies",
      "Inquired about data privacy, VPC hosting, and SOC2/HIPAA compliance",
      "Clarified citation grounding and hallucination tolerances",
      "Proposed phased delivery: Phase 1 (POC on 1,000 docs) -> Phase 2 (VPC deployment)"
    ]
  },
  {
    slug: "ecommerce-recommendation-api",
    clientName: "Maya Al-Mansoor",
    clientRole: "Head of Product",
    companyType: "Direct-to-Consumer Fashion Brand",
    initialBrief: "We want a smart AI recommendation engine on our checkout page to boost average order value by suggesting complementary apparel.",
    hiddenConstraints: {
      budgetRange: "$10,000 - $18,000 USD",
      timelineWeeks: 4,
      securityRequirement: "Sub-50ms API response time under 5,000 concurrent shopper spikes.",
      dataVolume: "1.2M historical purchase transactions with seasonal catalog rotations."
    },
    evaluationCriteria: [
      "Inquired about peak API traffic RPS and latency SLA constraints (<50ms)",
      "Clarified cold-start strategy for new inventory items with zero purchase history",
      "Proposed A/B testing framework to measure true incremental revenue lift",
      "Defined clear acceptance criteria and maintenance retainer"
    ]
  }
];

export function gradeFreelanceProposal(
  proposalText: string,
  scenarioSlug: string
): { score: number; strengths: string[]; weaknesses: string[]; feedback: string } {
  const scenario = FREELANCE_SCENARIOS.find((s) => s.slug === scenarioSlug) || FREELANCE_SCENARIOS[0];
  const lower = proposalText.toLowerCase();

  let score = 50;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (lower.includes("security") || lower.includes("vpc") || lower.includes("privacy")) {
    score += 15;
    strengths.push("Addressed enterprise security, VPC boundaries, and data privacy.");
  } else {
    weaknesses.push("Missing security posture: failed to explicitly state data privacy and zero-retention policies.");
  }

  if (lower.includes("phase") || lower.includes("milestone") || lower.includes("poc")) {
    score += 15;
    strengths.push("Structured delivery into de-risked phases (POC followed by full rollout).");
  } else {
    weaknesses.push("Lacks phased milestone architecture; high risk of scope creep.");
  }

  if (lower.includes("acceptance criteria") || lower.includes("metric") || lower.includes("latency") || lower.includes("sla")) {
    score += 15;
    strengths.push("Established objective acceptance criteria and technical SLAs.");
  } else {
    weaknesses.push("No explicit performance SLA or quantitative acceptance criteria defined.");
  }

  if (score > 100) score = 95;

  return {
    score,
    strengths,
    weaknesses,
    feedback: `Evaluated proposal for client '${scenario.clientName}'. Total Quality Score: ${score}/100. ${
      score >= 80 
        ? "Excellent enterprise-grade consulting proposal. Clear boundaries, metrics, and risk mitigation." 
        : "Proposal needs more rigor regarding security constraints and measurable delivery milestones."
    }`
  };
}
