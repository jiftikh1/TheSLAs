import { Dimension } from "@prisma/client";

export type Question = {
  id: string;
  text: string;
  placeholder: string;
  required: boolean;
  followUpTriggers?: { pattern: RegExp; followUp: Question }[];
};

export type Topic = {
  id: string;
  label: string;
  icon: string; // lucide icon name
  description: string;
  dimension: Dimension;
  coreQuestions: Question[];
};

// Cross-topic smart follow-up triggers
const GLOBAL_TRIGGERS: { pattern: RegExp; followUp: Question }[] = [
  {
    pattern: /pric|cost|bill|invoice/i,
    followUp: {
      id: "fu_pricing_surprise",
      text: "Did you know about this cost upfront, or was it a surprise post-signing?",
      placeholder: "e.g. It was buried in the contract appendix...",
      required: false,
    },
  },
  {
    pattern: /slow|lag|latenc|perform/i,
    followUp: {
      id: "fu_perf_impact",
      text: "Does this impact you in production, or only in edge cases?",
      placeholder: "e.g. It only shows up under heavy load but that's exactly when it matters...",
      required: false,
    },
  },
  {
    pattern: /support|CSM|rep|account manag/i,
    followUp: {
      id: "fu_support_fire",
      text: "How quickly do they respond when something is actually on fire?",
      placeholder: "e.g. SLA says 4 hours but in practice...",
      required: false,
    },
  },
  {
    pattern: /API|webhook|integrat/i,
    followUp: {
      id: "fu_api_docs",
      text: "Were their docs enough, or did you have to reverse-engineer it?",
      placeholder: "e.g. The docs were 2 versions behind and...",
      required: false,
    },
  },
  {
    pattern: /enterprise|seat|per user|per license/i,
    followUp: {
      id: "fu_scale_pricing",
      text: "How does pricing hold up as your team scales?",
      placeholder: "e.g. It looked reasonable at 50 seats but at 300...",
      required: false,
    },
  },
];

export const TOPICS: Topic[] = [
  {
    id: "day-to-day",
    label: "Day-to-day use",
    icon: "Monitor",
    description: "Everyday workflows, usability, and how it holds up in practice",
    dimension: "WORKFLOWS",
    coreQuestions: [
      {
        id: "dtd_1",
        text: "What does your team actually use this for day-to-day?",
        placeholder: "e.g. We use it primarily for pipeline management and our weekly forecast review...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "dtd_2",
        text: "Where does it become painful or slow your team down?",
        placeholder: "e.g. Reporting is clunky and anything cross-functional requires an export to Excel...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "dtd_3",
        text: "What's the one thing it genuinely does better than alternatives you've tried?",
        placeholder: "e.g. The pipeline visualization is unmatched — we've tried three others...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "dtd_verdict",
        text: "One-line verdict for someone evaluating it for daily use.",
        placeholder: "e.g. Solid for mature teams, expect 3 months to get real value out of it.",
        required: true,
      },
    ],
  },
  {
    id: "performance",
    label: "Performance & reliability",
    icon: "Zap",
    description: "Uptime, speed, and how it handles scale or pressure",
    dimension: "WORKFLOWS",
    coreQuestions: [
      {
        id: "perf_1",
        text: "How has uptime and reliability been in production?",
        placeholder: "e.g. We've had two major outages in 18 months, both during peak periods...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "perf_2",
        text: "Where does performance degrade — specific features, data volumes, or times of day?",
        placeholder: "e.g. Search gets noticeably slow past 50k records and reporting queries time out...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "perf_3",
        text: "How does support respond when there's an incident?",
        placeholder: "e.g. Status page lags reality by 30 min, but our CSM is usually responsive...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "perf_verdict",
        text: "One-line take on reliability for someone planning a critical deployment.",
        placeholder: "e.g. Fine for non-critical workloads, I wouldn't put revenue-critical pipelines on it.",
        required: true,
      },
    ],
  },
  {
    id: "integrations",
    label: "Integrations & API",
    icon: "Plug",
    description: "API quality, webhooks, native connectors, and integration pain",
    dimension: "INTEGRATIONS",
    coreQuestions: [
      {
        id: "int_1",
        text: "Which integrations did you build or rely on — and which ones worked well?",
        placeholder: "e.g. The Salesforce connector was plug-and-play, but the Slack integration was half-baked...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "int_2",
        text: "What broke, required workarounds, or took far more effort than advertised?",
        placeholder: "e.g. The API rate limits are undocumented and we hit them constantly...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "int_3",
        text: "How's the API documentation and developer experience?",
        placeholder: "e.g. REST docs are decent but the webhooks have no retry mechanism and no example payloads...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "int_verdict",
        text: "One-line verdict for an engineering team evaluating integrations.",
        placeholder: "e.g. Good enough for standard connectors, budget significant dev time for anything custom.",
        required: true,
      },
    ],
  },
  {
    id: "pricing",
    label: "Pricing & contracts",
    icon: "Receipt",
    description: "TCO, contract terms, negotiation experience, and billing surprises",
    dimension: "PARTNERSHIPS",
    coreQuestions: [
      {
        id: "price_1",
        text: "What surprised you when you actually got the bill?",
        placeholder: "e.g. Data overage charges weren't clearly explained upfront and hit us in month 3...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "price_2",
        text: "How did contract negotiations go — was the vendor flexible?",
        placeholder: "e.g. They budged on seats but were firm on the 3-year term. No month-to-month option...",
        required: true,
        followUpTriggers: [
          {
            pattern: /enterprise|seat|per user/i,
            followUp: {
              id: "fu_seat_scale",
              text: "Did per-seat pricing scale the way you expected as you grew?",
              placeholder: "e.g. We projected 100 users but ended up at 180 and the cost was...",
              required: false,
            },
          },
          ...GLOBAL_TRIGGERS,
        ],
      },
      {
        id: "price_3",
        text: "What's the true total cost — including implementation, training, and add-ons?",
        placeholder: "e.g. License was $80k but implementation and onboarding brought total year-1 to $130k...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "price_verdict",
        text: "One-line take for someone about to sign the contract.",
        placeholder: "e.g. Get the SLA addendum negotiated before signing — they'll give it to you.",
        required: true,
      },
    ],
  },
  {
    id: "vendor-support",
    label: "Vendor support",
    icon: "Headphones",
    description: "CSM quality, support responsiveness, and escalation paths",
    dimension: "PARTNERSHIPS",
    coreQuestions: [
      {
        id: "vs_1",
        text: "How responsive is your CSM or account team — day-to-day and during issues?",
        placeholder: "e.g. Our CSM is great but switches every 6 months. The tier-1 support desk is useless...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "vs_2",
        text: "How do they handle escalations when things go wrong?",
        placeholder: "e.g. Getting to someone who can actually fix things requires going around the ticket system...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "vs_3",
        text: "What does their roadmap/feature request process actually look like in practice?",
        placeholder: "e.g. They have an ideas portal but I've never seen a request shipped. It's mostly theater...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "vs_verdict",
        text: "One-line verdict on the vendor relationship.",
        placeholder: "e.g. Decent partner if you stay on top of them — set-it-and-forget-it doesn't work here.",
        required: true,
      },
    ],
  },
  {
    id: "onboarding",
    label: "Onboarding & setup",
    icon: "Rocket",
    description: "Implementation timeline, learning curve, and time-to-value",
    dimension: "WORKFLOWS",
    coreQuestions: [
      {
        id: "ob_1",
        text: "How long did go-live actually take vs. what was promised?",
        placeholder: "e.g. Vendor said 6 weeks, we were live in 4 months due to data migration issues...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "ob_2",
        text: "What was the steepest part of the learning curve for your team?",
        placeholder: "e.g. Power users got it quickly but ops team needed 3 months to feel confident...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "ob_3",
        text: "What would you do differently if you were starting the implementation over?",
        placeholder: "e.g. Spend more time on data model design before go-live — retrofitting is painful...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "ob_verdict",
        text: "One-line verdict for a team about to kick off implementation.",
        placeholder: "e.g. Plan for twice the timeline and half the vendor support you were promised.",
        required: true,
      },
    ],
  },
  {
    id: "pain-points",
    label: "Pain points",
    icon: "AlertTriangle",
    description: "The landmines, gotchas, and things you wish you'd known before go-live",
    dimension: "ISSUES",
    coreQuestions: [
      {
        id: "pp_1",
        text: "What are the landmines — the things you only discover months in?",
        placeholder: "e.g. The reporting module looks powerful but anything non-standard requires professional services...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "pp_2",
        text: "What breaks at scale that worked fine in the pilot?",
        placeholder: "e.g. Worked great with 20 users. At 150, the permissions model became a nightmare to manage...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "pp_3",
        text: "What do you wish someone had told you before you signed?",
        placeholder: "e.g. The 'out of the box' integrations all require separate paid add-ons...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "pp_verdict",
        text: "One-line warning for someone about to buy.",
        placeholder: "e.g. Great demo, rough reality — do a 90-day pilot before committing.",
        required: true,
      },
    ],
  },
  {
    id: "security",
    label: "Security & compliance",
    icon: "Shield",
    description: "Security posture, certifications, data handling, and compliance gaps",
    dimension: "ISSUES",
    coreQuestions: [
      {
        id: "sec_1",
        text: "What certifications or compliance frameworks does it support, and how well?",
        placeholder: "e.g. SOC2 Type II is current, HIPAA BAA available but took 3 weeks to get executed...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "sec_2",
        text: "What security or data handling concerns have come up in practice?",
        placeholder: "e.g. Single-tenant option exists but costs 3x. Data residency options are limited to US...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "sec_3",
        text: "How responsive are they when your security team asks hard questions?",
        placeholder: "e.g. Their security team is responsive but the pen test reports took 6 weeks to get...",
        required: true,
        followUpTriggers: GLOBAL_TRIGGERS,
      },
      {
        id: "sec_verdict",
        text: "One-line verdict for a security-conscious buyer.",
        placeholder: "e.g. Adequate for mid-market, would not recommend for highly regulated enterprise.",
        required: true,
      },
    ],
  },
];

export const TOPIC_TO_DIMENSION: Record<string, Dimension> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t.dimension])
);

export function getTopicById(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}

/** Check if an answer text triggers any follow-up questions */
export function getTriggeredFollowUps(
  answer: string,
  question: Question
): Question[] {
  if (!question.followUpTriggers) return [];
  const seen = new Set<string>();
  const result: Question[] = [];
  for (const trigger of question.followUpTriggers) {
    if (trigger.pattern.test(answer) && !seen.has(trigger.followUp.id)) {
      seen.add(trigger.followUp.id);
      result.push(trigger.followUp);
    }
  }
  return result;
}
