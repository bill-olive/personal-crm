/**
 * 1stUp Health product knowledge base for context-aware selling.
 * Used by AI agents for recommendations and sales conversations.
 */

export type PricingTier = "starter" | "professional" | "enterprise";

export interface ProductCatalogItem {
  name: string;
  description: string;
  keyFeatures: string[];
  typicalBuyers: string[];
  pricingTier: PricingTier;
  complianceInfo: string;
  competitiveAdvantage: string;
}

export const PRODUCT_CATALOG: ProductCatalogItem[] = [
  {
    name: "FHIR API Platform",
    description:
      "Enterprise-grade FHIR R4 API infrastructure for health data exchange. Enables payers to expose member data, provider directories, and clinical data via standardized APIs per CMS-0057-F and CMS-9115-F requirements.",
    keyFeatures: [
      "FHIR R4 compliant REST APIs",
      "OAuth 2.0 / SMART on FHIR authentication",
      "Bulk data export (Patient, Coverage, ExplanationOfBenefit)",
      "Sub-second response times at scale",
      "Multi-tenant SaaS architecture",
      "Built-in rate limiting and throttling",
    ],
    typicalBuyers: ["CTO", "VP Engineering", "Chief Medical Informatics Officer"],
    pricingTier: "enterprise",
    complianceInfo:
      "Full CMS-0057-F compliance for Patient Access API, Provider Directory API, and Payer-to-Payer. HITRUST CSF certified. Ready for CMS-9115-F prior authorization requirements.",
    competitiveAdvantage:
      "Data lakehouse architecture enables 10x faster queries than traditional data warehouses. Proven at 50M+ member scale. Native support for both real-time and batch workflows.",
  },
  {
    name: "Electronic Prior Authorization",
    description:
      "End-to-end prior authorization automation platform. Reduces manual review time by 80% through intelligent document routing, AI-assisted clinical review, and real-time status tracking.",
    keyFeatures: [
      "FHIR-based prior auth workflows",
      "DAVinci integration for payer-provider exchange",
      "Automated document classification and routing",
      "AI-assisted clinical review recommendations",
      "Real-time status tracking and notifications",
      "Analytics dashboard for turnaround metrics",
    ],
    typicalBuyers: ["VP of Product", "Chief Medical Informatics Officer", "Compliance Officer"],
    pricingTier: "professional",
    complianceInfo:
      "Supports CMS-9115-F electronic prior auth requirements. FHIR-based workflows for PAS and Payer-to-Payer. HITRUST CSF certified. Ready for state-level mandates.",
    competitiveAdvantage:
      "Only solution with native FHIR + DAVinci integration. Reduces average turnaround from 5 days to 24 hours. 40% reduction in manual review costs.",
  },
  {
    name: "Payer-to-Payer Data Exchange",
    description:
      "Member data portability solution enabling seamless transfer of member data between payers. Supports CMS-0057-F requirements for member-initiated data sharing across health plans.",
    keyFeatures: [
      "Member-initiated data transfer workflows",
      "Bulk data export (Patient, Coverage, EOB)",
      "Secure payer-to-payer API connections",
      "Member consent management",
      "Transfer status tracking and audit",
      "Data quality validation",
    ],
    typicalBuyers: ["CTO", "VP Engineering", "Compliance Officer"],
    pricingTier: "enterprise",
    complianceInfo:
      "Full CMS-0057-F Payer-to-Payer compliance. Supports member data sharing within 1 business day. Includes consent audit trail for regulatory reporting.",
    competitiveAdvantage:
      "Pre-built connector network with major health plans. Handles 100K+ transfers/month without manual intervention. Lowest implementation time in market (6-8 weeks).",
  },
  {
    name: "Provider Access API",
    description:
      "Provider-facing API for clinical data access. Enables providers to retrieve member data at point of care for treatment decisions, care coordination, and quality reporting.",
    keyFeatures: [
      "Provider-facing FHIR Patient Access API",
      "Provider Directory Integration",
      "Clinical data retrieval (conditions, medications, allergies)",
      "Provider authentication and consent",
      "Usage analytics and reporting",
      "EHR integration support",
    ],
    typicalBuyers: ["Chief Medical Informatics Officer", "VP Engineering", "VP of Product"],
    pricingTier: "professional",
    complianceInfo:
      "CMS-0057-F Provider Access API compliant. Supports provider directory lookup. OAuth 2.0 / SMART on FHIR for provider authentication.",
    competitiveAdvantage:
      "Lowest latency in market (< 200ms p95). Pre-built EHR integrations for Epic, Cerner, Athenahealth. Reduces provider support calls by 35%.",
  },
  {
    name: "Patient Access Portal",
    description:
      "Member-facing health data access solution. Enables members to view and download their health information via web and mobile, with secure third-party app connections.",
    keyFeatures: [
      "Member self-service portal",
      "FHIR Patient Access API",
      "Third-party app authorization (OAuth 2.0)",
      "Bulk data export (Patient, Coverage, EOB)",
      "Mobile-responsive design",
      "Accessibility compliance (WCAG 2.1 AA)",
    ],
    typicalBuyers: ["VP of Product", "VP Engineering", "Chief Medical Informatics Officer"],
    pricingTier: "professional",
    complianceInfo:
      "Full CMS-0057-F Patient Access API compliance. Member data available within 1 business day. HIPAA-compliant with BAA. WCAG 2.1 AA for accessibility.",
    competitiveAdvantage:
      "White-label solution with 2-week customization. 4.8/5 member satisfaction score. 60% reduction in member service calls for data requests.",
  },
  {
    name: "Provider Directory",
    description:
      "Centralized provider directory management and API. Maintains accurate, up-to-date provider information for network adequacy, member lookup, and provider access workflows.",
    keyFeatures: [
      "FHIR PractitionerRole and Organization resources",
      "Bulk upload and validation",
      "Real-time directory API",
      "Provider attestation workflows",
      "Network adequacy reporting",
      "Change history and audit trail",
    ],
    typicalBuyers: ["VP of Product", "Compliance Officer", "VP Engineering"],
    pricingTier: "starter",
    complianceInfo:
      "CMS-0057-F Provider Directory API compliant. Supports 30-day update cycle. Includes data quality validation and NPI verification.",
    competitiveAdvantage:
      "Automated data quality scoring. 95% reduction in directory errors. Integrates with CAQH for provider data enrichment.",
  },
  {
    name: "Formulary Management",
    description:
      "Drug formulary and pharmacy data exchange. Enables real-time formulary lookup, prior authorization for prescriptions, and medication coverage verification.",
    keyFeatures: [
      "FHIR MedicationKnowledge resources",
      "Real-time formulary lookup API",
      "Prior auth for prescription workflows",
      "Coverage verification",
      "Formulary version management",
      "Pharmacy network integration",
    ],
    typicalBuyers: ["Chief Medical Informatics Officer", "VP of Product", "Compliance Officer"],
    pricingTier: "professional",
    complianceInfo:
      "Supports CMS-9115-F electronic prior auth for prescriptions. FHIR R4 MedicationKnowledge. Ready for state-level pharmacy mandates.",
    competitiveAdvantage:
      "Only FHIR-native formulary solution. Reduces pharmacy call center volume by 45%. Real-time formulary updates (vs. 24-48hr industry standard).",
  },
  {
    name: "Analytics & Reporting",
    description:
      "Healthcare analytics and compliance reporting platform. Pre-built dashboards for CMS mandates, API usage metrics, compliance KPIs, and operational insights.",
    keyFeatures: [
      "CMS compliance dashboards",
      "API usage and performance metrics",
      "Member consent and access audit",
      "Custom report builder",
      "Scheduled export and alerts",
      "Data quality monitoring",
    ],
    typicalBuyers: ["Compliance Officer", "VP Engineering", "VP of Product"],
    pricingTier: "professional",
    complianceInfo:
      "Pre-built reports for CMS-0057-F compliance attestation. Audit trail for all member data access. Supports regulatory reporting requirements.",
    competitiveAdvantage:
      "Out-of-the-box compliance reports. 90% faster audit preparation. Real-time compliance monitoring vs. batch reporting.",
  },
  {
    name: "Member Data Lakehouse",
    description:
      "Unified data platform for member health data. Combines claims, clinical, and administrative data in a FHIR-native lakehouse for analytics, compliance, and API serving.",
    keyFeatures: [
      "FHIR-native data model",
      "Claims-to-FHIR transformation",
      "Clinical data ingestion (CCDA, HL7v2)",
      "Unified member 360 view",
      "API serving layer",
      "Data quality and lineage",
    ],
    typicalBuyers: ["CTO", "VP Engineering", "Chief Medical Informatics Officer"],
    pricingTier: "enterprise",
    complianceInfo:
      "HITRUST CSF certified. Supports data residency requirements. Full audit trail for data lineage and access.",
    competitiveAdvantage:
      "10x faster queries than traditional data warehouses. Single platform for both API and analytics. Reduces data engineering effort by 70%.",
  },
  {
    name: "CMS Compliance Suite",
    description:
      "End-to-end compliance automation for CMS interoperability mandates. Orchestrates Patient Access, Provider Directory, Payer-to-Payer, and Prior Auth workflows with built-in compliance monitoring.",
    keyFeatures: [
      "Unified compliance dashboard",
      "Mandate readiness assessment",
      "Automated compliance reporting",
      "Gap remediation workflows",
      "Regulatory change alerts",
      "Audit preparation tools",
    ],
    typicalBuyers: ["Compliance Officer", "CTO", "VP of Product"],
    pricingTier: "enterprise",
    complianceInfo:
      "Covers CMS-0057-F, CMS-9115-F, and state-level mandates. HITRUST CSF certified. Includes compliance attestation support.",
    competitiveAdvantage:
      "Only solution with real-time compliance scoring. Reduces compliance audit time by 75%. Proactive regulatory change monitoring.",
  },
];
