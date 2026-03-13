/**
 * Buyer persona templates for healthcare industry roles.
 * Used by AI agents for context-aware messaging and engagement.
 */

export interface BuyerPersona {
  title: string;
  department: string;
  priorities: string[];
  painPoints: string[];
  messagingHooks: string[];
  typicalQuestions: string[];
}

export const BUYER_PERSONAS: BuyerPersona[] = [
  {
    title: "CTO",
    department: "Technology",
    priorities: [
      "Modernizing legacy systems",
      "Architecture scalability and reliability",
      "Developer velocity and API-first strategy",
      "Technical debt reduction",
      "Cloud-native infrastructure",
    ],
    painPoints: [
      "Legacy mainframe and batch systems",
      "Fragmented data across silos",
      "Slow integration timelines",
      "Compliance as an afterthought",
      "Difficulty attracting talent for legacy tech",
    ],
    messagingHooks: [
      "API-first architecture that scales to 50M+ members",
      "Reduce integration time from months to weeks",
      "Modern tech stack that attracts top engineering talent",
      "Eliminate technical debt with FHIR-native design",
      "Proven at scale with top-tier health plans",
    ],
    typicalQuestions: [
      "What's your architecture approach for multi-tenant isolation?",
      "How do you handle data residency and compliance?",
      "What's the typical implementation timeline?",
      "How do you compare to building in-house?",
      "What's your disaster recovery and uptime SLA?",
    ],
  },
  {
    title: "VP Engineering",
    department: "Engineering",
    priorities: [
      "Delivery predictability",
      "Team productivity and tooling",
      "Quality and reliability",
      "Reducing operational overhead",
      "Hiring and retention",
    ],
    painPoints: [
      "Constant firefighting and compliance deadlines",
      "Integration complexity with EHR vendors",
      "Maintaining multiple legacy systems",
      "Documentation and knowledge gaps",
      "Vendor lock-in concerns",
    ],
    messagingHooks: [
      "Pre-built EHR integrations for Epic, Cerner, Athenahealth",
      "Comprehensive API documentation and developer portal",
      "Managed service reduces ops burden by 60%",
      "Standardized FHIR reduces integration complexity",
      "Proven implementation playbook from 20+ health plans",
    ],
    typicalQuestions: [
      "What's your implementation methodology?",
      "How do you handle EHR vendor integrations?",
      "What's the developer experience and documentation?",
      "What's the support model for production issues?",
      "Can we customize or extend the platform?",
    ],
  },
  {
    title: "Chief Medical Informatics Officer",
    department: "Clinical Informatics",
    priorities: [
      "Clinical data quality and interoperability",
      "Provider experience and adoption",
      "Care coordination and outcomes",
      "Regulatory compliance",
      "Clinical decision support",
    ],
    painPoints: [
      "Data fragmentation across systems",
      "Provider burden with multiple systems",
      "Prior auth delays impacting care",
      "Incomplete member data at point of care",
      "Compliance deadlines without clinical input",
    ],
    messagingHooks: [
      "Unified member 360 view for clinical decision-making",
      "Reduce prior auth turnaround from 5 days to 24 hours",
      "Provider data access at point of care (< 200ms)",
      "Clinical data quality built-in, not bolted-on",
      "Designed with clinical workflows in mind",
    ],
    typicalQuestions: [
      "How does this improve provider workflow?",
      "What clinical data is available at point of care?",
      "How do you handle data quality and completeness?",
      "What's the impact on prior auth turnaround?",
      "How do you support care coordination use cases?",
    ],
  },
  {
    title: "Compliance Officer",
    department: "Compliance / Regulatory",
    priorities: [
      "CMS mandate compliance",
      "Audit readiness",
      "Risk mitigation",
      "Regulatory change management",
      "Vendor compliance",
    ],
    painPoints: [
      "Keeping pace with CMS rule changes",
      "Manual audit preparation",
      "Vendor compliance verification",
      "Gap remediation tracking",
      "Cross-state mandate variations",
    ],
    messagingHooks: [
      "Built for CMS-0057-F and CMS-9115-F from day one",
      "Real-time compliance dashboards vs. batch reporting",
      "HITRUST CSF certified with annual audits",
      "Pre-built compliance reporting and attestation",
      "Proactive regulatory change alerts",
    ],
    typicalQuestions: [
      "What's your compliance certification status?",
      "How do you handle audit requests?",
      "What's the data retention and audit trail?",
      "How do you handle state-level mandate variations?",
      "What's your BAA and security documentation?",
    ],
  },
  {
    title: "VP of Product",
    department: "Product",
    priorities: [
      "Member and provider experience",
      "Differentiation and competitive advantage",
      "Roadmap alignment with business goals",
      "Time to market for new features",
      "Product metrics and outcomes",
    ],
    painPoints: [
      "Compliance as a constraint vs. differentiator",
      "Balancing regulatory mandates with innovation",
      "Integration with partner ecosystem",
      "Measuring member engagement",
      "Competitive pressure from digital-first players",
    ],
    messagingHooks: [
      "Turn compliance into competitive advantage",
      "Member satisfaction scores of 4.8/5",
      "60% reduction in member service calls",
      "White-label solution with 2-week customization",
      "Fastest time to market for new interoperability features",
    ],
    typicalQuestions: [
      "What's the member experience like?",
      "How customizable is the solution?",
      "What's your product roadmap?",
      "How do you measure success and outcomes?",
      "What's the typical implementation timeline?",
    ],
  },
];
