/**
 * Seed Script for 1stUp Health CRM
 * 
 * Populates Firestore with realistic demo data for healthcare sales.
 * 
 * Usage:
 *   npx ts-node scripts/seed.ts
 * 
 * Requires:
 *   - FIREBASE_PROJECT_ID environment variable
 *   - FIREBASE_CLIENT_EMAIL environment variable
 *   - FIREBASE_PRIVATE_KEY environment variable
 */

import * as admin from "firebase-admin";

// Initialize Firebase Admin
const projectId = process.env.FIREBASE_PROJECT_ID || "demo-project";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

if (clientEmail && privateKey) {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
} else {
  // Use emulator
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
  admin.initializeApp({ projectId });
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// ─── Constants ─────────────────────────────────────────────────────────────

const ORG_ID = "demo-org";
const USER_ID = "demo-user";
const NOW = FieldValue.serverTimestamp();

// ─── Seed Functions ────────────────────────────────────────────────────────

async function seedOrganization() {
  console.log("📁 Creating organization...");
  await db.doc(`organizations/${ORG_ID}`).set({
    name: "1stUp Health",
    domain: "1up.health",
    logoUrl: null,
    plan: "enterprise",
    settings: {
      defaultCurrency: "USD",
      timezone: "America/New_York",
      fiscalYearStart: 1,
    },
    createdAt: NOW,
    updatedAt: NOW,
  });
}

async function seedUser() {
  console.log("👤 Creating demo user...");
  await db.doc(`users/${USER_ID}`).set({
    email: "sales@1up.health",
    displayName: "Alex Rivera",
    avatarUrl: null,
    orgId: ORG_ID,
    role: "admin",
    title: "VP of Sales",
    preferences: {
      theme: "system",
      notifications: true,
      emailDigest: true,
    },
    createdAt: NOW,
    updatedAt: NOW,
  });
}

async function seedAccounts() {
  console.log("🏢 Creating accounts...");
  const accounts = [
    {
      id: "acc-cvs",
      name: "CVS Health",
      domain: "cvshealth.com",
      industry: "Health Insurance / PBM",
      size: "enterprise",
      healthPlanType: "commercial",
      stage: "customer",
      annualValue: 1250000,
      products: ["FHIR API Platform", "Electronic Prior Authorization"],
      region: "Northeast",
      website: "https://www.cvshealth.com",
      memberCount: 35000000,
      primaryContactId: "con-sarah",
      ownerId: USER_ID,
      tags: ["strategic", "multi-product"],
      notes: "Long-standing customer. Deployed FHIR API in 2024. Looking to expand to Prior Auth automation.",
    },
    {
      id: "acc-uhg",
      name: "UnitedHealth Group",
      domain: "unitedhealthgroup.com",
      industry: "Managed Care",
      size: "enterprise",
      healthPlanType: "commercial",
      stage: "poc",
      annualValue: 2400000,
      products: ["Payer-to-Payer Data Exchange", "Provider Access API"],
      region: "Midwest",
      website: "https://www.unitedhealthgroup.com",
      memberCount: 52000000,
      primaryContactId: "con-michael",
      ownerId: USER_ID,
      tags: ["high-value", "poc-active"],
      notes: "POC for payer-to-payer exchange in progress. Key decision maker is Michael Torres (VP Engineering).",
    },
    {
      id: "acc-anthem",
      name: "Elevance Health (Anthem)",
      domain: "elevancehealth.com",
      industry: "Health Insurance",
      size: "enterprise",
      healthPlanType: "commercial",
      stage: "qualified",
      annualValue: 850000,
      products: [],
      region: "Midwest",
      website: "https://www.elevancehealth.com",
      memberCount: 47000000,
      primaryContactId: "con-jennifer",
      ownerId: USER_ID,
      tags: ["qualified", "cms-mandate"],
      notes: "Qualified lead from CMS-0057-F mandate. Jennifer Lee is the compliance officer driving the initiative.",
    },
    {
      id: "acc-humana",
      name: "Humana",
      domain: "humana.com",
      industry: "Health Insurance",
      size: "enterprise",
      healthPlanType: "medicare",
      stage: "contract",
      annualValue: 680000,
      products: ["Patient Access Portal", "Provider Directory"],
      region: "Southeast",
      website: "https://www.humana.com",
      memberCount: 26000000,
      primaryContactId: "con-david",
      ownerId: USER_ID,
      tags: ["medicare-focus", "contract-stage"],
      notes: "Contract negotiation for Patient Access Portal. Strong champion in David Kim (CTO).",
    },
    {
      id: "acc-cigna",
      name: "The Cigna Group",
      domain: "thecignagroup.com",
      industry: "Health Services",
      size: "enterprise",
      healthPlanType: "commercial",
      stage: "prospect",
      annualValue: 0,
      products: [],
      region: "Northeast",
      website: "https://www.thecignagroup.com",
      memberCount: 19000000,
      primaryContactId: "con-emily",
      ownerId: USER_ID,
      tags: ["prospect", "cold-outreach"],
      notes: "Initial prospect. No prior engagement. Identified through competitor displacement opportunity.",
    },
    {
      id: "acc-centene",
      name: "Centene Corporation",
      domain: "centene.com",
      industry: "Managed Care",
      size: "enterprise",
      healthPlanType: "medicaid",
      stage: "customer",
      annualValue: 980000,
      products: ["FHIR API Platform", "Analytics & Reporting", "CMS Compliance Suite"],
      region: "Midwest",
      website: "https://www.centene.com",
      memberCount: 28000000,
      primaryContactId: "con-robert",
      ownerId: USER_ID,
      tags: ["medicaid", "multi-product", "expansion-target"],
      notes: "Established customer with 3 products deployed. Strong expansion opportunity for Payer-to-Payer exchange.",
    },
  ];

  const batch = db.batch();
  for (const account of accounts) {
    const { id, ...data } = account;
    batch.set(db.doc(`organizations/${ORG_ID}/accounts/${id}`), {
      ...data,
      createdAt: NOW,
      updatedAt: NOW,
    });
  }
  await batch.commit();
}

async function seedContacts() {
  console.log("👥 Creating contacts...");
  const contacts = [
    { id: "con-sarah", firstName: "Sarah", lastName: "Chen", email: "sarah.chen@cvshealth.com", phone: "+1-401-555-0101", title: "VP of Engineering", department: "Technology", accountId: "acc-cvs", tags: ["champion", "technical"] },
    { id: "con-james", firstName: "James", lastName: "Park", email: "james.park@cvshealth.com", phone: "+1-401-555-0102", title: "Director of Interoperability", department: "Technology", accountId: "acc-cvs", tags: ["technical", "decision-maker"] },
    { id: "con-michael", firstName: "Michael", lastName: "Torres", email: "michael.torres@unitedhealthgroup.com", phone: "+1-952-555-0201", title: "VP of Engineering", department: "Technology", accountId: "acc-uhg", tags: ["champion", "budget-holder"] },
    { id: "con-aisha", firstName: "Aisha", lastName: "Rahman", email: "aisha.rahman@unitedhealthgroup.com", phone: "+1-952-555-0202", title: "Chief Architect", department: "Technology", accountId: "acc-uhg", tags: ["technical", "influencer"] },
    { id: "con-jennifer", firstName: "Jennifer", lastName: "Lee", email: "jennifer.lee@elevancehealth.com", phone: "+1-317-555-0301", title: "Chief Compliance Officer", department: "Compliance", accountId: "acc-anthem", tags: ["compliance", "executive"] },
    { id: "con-david", firstName: "David", lastName: "Kim", email: "david.kim@humana.com", phone: "+1-502-555-0401", title: "CTO", department: "Technology", accountId: "acc-humana", tags: ["champion", "c-suite"] },
    { id: "con-emily", firstName: "Emily", lastName: "Watson", email: "emily.watson@thecignagroup.com", phone: "+1-860-555-0501", title: "VP of Product", department: "Product", accountId: "acc-cigna", tags: ["prospect", "product-leader"] },
    { id: "con-robert", firstName: "Robert", lastName: "Martinez", email: "robert.martinez@centene.com", phone: "+1-314-555-0601", title: "VP of Data Engineering", department: "Technology", accountId: "acc-centene", tags: ["champion", "technical"] },
    { id: "con-lisa", firstName: "Lisa", lastName: "Thompson", email: "lisa.thompson@centene.com", phone: "+1-314-555-0602", title: "Director of Compliance", department: "Compliance", accountId: "acc-centene", tags: ["compliance", "influencer"] },
    { id: "con-mark", firstName: "Mark", lastName: "Johnson", email: "mark.johnson@humana.com", phone: "+1-502-555-0402", title: "VP of Member Experience", department: "Product", accountId: "acc-humana", tags: ["user-advocate", "influencer"] },
  ];

  const batch = db.batch();
  for (const contact of contacts) {
    const { id, ...data } = contact;
    batch.set(db.doc(`organizations/${ORG_ID}/contacts/${id}`), {
      ...data,
      notes: "",
      linkedInUrl: "",
      avatarUrl: null,
      createdAt: NOW,
      updatedAt: NOW,
    });
  }
  await batch.commit();
}

async function seedDeals() {
  console.log("💰 Creating deals...");
  const deals = [
    { id: "deal-1", title: "CVS - Prior Auth Expansion", accountId: "acc-cvs", contactIds: ["con-sarah", "con-james"], stage: "proposal", value: 850000, currency: "USD", probability: 65, products: ["Electronic Prior Authorization"], ownerId: USER_ID, tags: ["expansion"] },
    { id: "deal-2", title: "UHG - Payer-to-Payer Exchange", accountId: "acc-uhg", contactIds: ["con-michael", "con-aisha"], stage: "poc", value: 1200000, currency: "USD", probability: 50, products: ["Payer-to-Payer Data Exchange", "Provider Access API"], ownerId: USER_ID, tags: ["new-logo", "high-value"] },
    { id: "deal-3", title: "Elevance - CMS Compliance Suite", accountId: "acc-anthem", contactIds: ["con-jennifer"], stage: "demo", value: 650000, currency: "USD", probability: 25, products: ["CMS Compliance Suite", "FHIR API Platform"], ownerId: USER_ID, tags: ["compliance-driven"] },
    { id: "deal-4", title: "Humana - Patient Access Portal", accountId: "acc-humana", contactIds: ["con-david", "con-mark"], stage: "negotiation", value: 420000, currency: "USD", probability: 80, products: ["Patient Access Portal"], ownerId: USER_ID, tags: ["near-close"] },
    { id: "deal-5", title: "Cigna - Analytics Platform", accountId: "acc-cigna", contactIds: ["con-emily"], stage: "discovery", value: 380000, currency: "USD", probability: 10, products: ["Analytics & Reporting", "FHIR API Platform"], ownerId: USER_ID, tags: ["early-stage"] },
    { id: "deal-6", title: "Centene - Payer Exchange Expansion", accountId: "acc-centene", contactIds: ["con-robert", "con-lisa"], stage: "proposal", value: 560000, currency: "USD", probability: 70, products: ["Payer-to-Payer Data Exchange"], ownerId: USER_ID, tags: ["expansion", "cross-sell"] },
    { id: "deal-7", title: "CVS - Member Data Lakehouse", accountId: "acc-cvs", contactIds: ["con-sarah"], stage: "discovery", value: 1500000, currency: "USD", probability: 15, products: ["Member Data Lakehouse"], ownerId: USER_ID, tags: ["upsell", "strategic"] },
    { id: "deal-8", title: "Humana - Formulary Management", accountId: "acc-humana", contactIds: ["con-david"], stage: "closed_won", value: 280000, currency: "USD", probability: 100, products: ["Formulary Management"], ownerId: USER_ID, tags: ["won"] },
  ];

  const batch = db.batch();
  for (const deal of deals) {
    const { id, ...data } = deal;
    batch.set(db.doc(`organizations/${ORG_ID}/deals/${id}`), {
      ...data,
      notes: "",
      createdAt: NOW,
      updatedAt: NOW,
    });
  }
  await batch.commit();
}

async function seedActivities() {
  console.log("📋 Creating activities...");
  const activities = [
    { id: "act-1", type: "meeting", subject: "Quarterly Business Review with CVS Health", description: "Reviewed deployment progress, discussed Prior Auth expansion timeline. Sarah confirmed budget for Q2.", accountId: "acc-cvs", contactId: "con-sarah", dealId: "deal-1", ownerId: USER_ID, metadata: { duration: 60, attendees: ["sarah.chen@cvshealth.com", "james.park@cvshealth.com"], location: "Zoom" } },
    { id: "act-2", type: "call", subject: "POC status call with UnitedHealth", description: "Michael shared positive feedback on payer-to-payer exchange POC. Technical team requesting API rate limit increase.", accountId: "acc-uhg", contactId: "con-michael", dealId: "deal-2", ownerId: USER_ID, metadata: { duration: 30 } },
    { id: "act-3", type: "email", subject: "CMS-0057-F Compliance Brief sent to Elevance", description: "Sent compliance roadmap document showing how 1stUp Health addresses all CMS-0057-F requirements.", accountId: "acc-anthem", contactId: "con-jennifer", dealId: "deal-3", ownerId: USER_ID },
    { id: "act-4", type: "meeting", subject: "Contract review meeting with Humana legal", description: "Reviewed MSA terms. David confirmed CTO sign-off. Legal requesting indemnification clause revision.", accountId: "acc-humana", contactId: "con-david", dealId: "deal-4", ownerId: USER_ID, metadata: { duration: 45, attendees: ["david.kim@humana.com"], location: "Microsoft Teams" } },
    { id: "act-5", type: "note", subject: "Competitive intel: Cigna evaluating Redox", description: "Industry source confirmed Cigna is also evaluating Redox for FHIR capabilities. Need to accelerate outreach and emphasize our data lakehouse advantage.", accountId: "acc-cigna", dealId: "deal-5", ownerId: USER_ID },
    { id: "act-6", type: "task", subject: "Prepare demo environment for Elevance", description: "Set up sandbox with sample Medicare data for Jennifer's team to evaluate.", accountId: "acc-anthem", dealId: "deal-3", ownerId: USER_ID },
    { id: "act-7", type: "email", subject: "Follow-up: Centene expansion proposal", description: "Sent updated pricing proposal for Payer-to-Payer Data Exchange add-on. Robert confirmed review by Friday.", accountId: "acc-centene", contactId: "con-robert", dealId: "deal-6", ownerId: USER_ID },
    { id: "act-8", type: "call", subject: "Discovery call with Cigna VP Product", description: "Initial discovery call with Emily Watson. Discussed current pain points with data exchange and interest in unified analytics.", accountId: "acc-cigna", contactId: "con-emily", dealId: "deal-5", ownerId: USER_ID, metadata: { duration: 25 } },
  ];

  const batch = db.batch();
  for (const activity of activities) {
    const { id, ...data } = activity;
    batch.set(db.doc(`organizations/${ORG_ID}/activities/${id}`), {
      ...data,
      createdAt: NOW,
    });
  }
  await batch.commit();
}

async function seedInsights() {
  console.log("💡 Creating insights...");
  const insights = [
    {
      id: "ins-1",
      type: "research",
      title: "CVS Health Technology Stack Analysis",
      content: "## CVS Health Technology Landscape\n\nCVS Health operates a complex technology ecosystem supporting 35M+ members across commercial, Medicare, and Medicaid lines.\n\n### Current FHIR Implementation\n- Deployed 1stUp Health FHIR API Platform in Q3 2024\n- Processing 2.5M API calls/month\n- Integrated with Epic EHR for clinical data exchange\n\n### Expansion Opportunities\n1. **Electronic Prior Authorization**: Currently using manual fax-based process. Estimated 500K prior auth requests/year. Automation could save $12M annually.\n2. **Member Data Lakehouse**: Fragmented data across 7 different systems. Unified lakehouse could reduce report generation time by 80%.\n\n### Key Decision Makers\n- Sarah Chen (VP Engineering) - Technical champion\n- James Park (Dir. Interoperability) - Day-to-day contact\n- CFO office - Budget approval for >$500K deals",
      summary: "CVS Health has strong FHIR adoption with clear expansion paths in Prior Auth and Data Lakehouse.",
      accountId: "acc-cvs",
      source: "agent",
      tags: ["research", "expansion"],
      createdBy: USER_ID,
    },
    {
      id: "ins-2",
      type: "competitive_intel",
      title: "Competitive Analysis: Redox vs 1stUp Health",
      content: "## Redox Competitive Positioning\n\n### Where Redox Competes\n- EHR integration and clinical data exchange\n- Provider-facing APIs\n- Smaller health plans (<5M members)\n\n### 1stUp Health Advantages\n1. **Data Lakehouse Architecture**: Unified data model vs. Redox's pass-through approach\n2. **CMS Compliance**: Purpose-built for CMS-9115-F and CMS-0057-F mandates\n3. **Scale**: Proven at 50M+ member scale vs. Redox's mid-market focus\n4. **Payer-First Design**: Built for payer workflows vs. Redox's provider-centric origin\n\n### Where Redox Has Advantage\n- Broader EHR connectivity network (300+ EHR systems)\n- Faster initial integration for simple use cases\n- Lower entry price point for basic API access\n\n### Win Strategy\n- Emphasize total cost of ownership at scale\n- Lead with compliance automation capabilities\n- Demonstrate data lakehouse value for analytics",
      summary: "1stUp Health has strong positioning against Redox on scale, compliance, and data lakehouse capabilities.",
      source: "agent",
      tags: ["competitive", "redox"],
      createdBy: USER_ID,
    },
    {
      id: "ins-3",
      type: "meeting_notes",
      title: "UnitedHealth POC Review - Week 4 Update",
      content: "## POC Review Meeting Notes\n**Date**: March 10, 2026\n**Attendees**: Michael Torres, Aisha Rahman, Alex Rivera\n\n### Key Updates\n- Payer-to-payer exchange POC processing 10K member records/day\n- Data quality scores averaging 97.2% (above 95% threshold)\n- Integration with UHG's claims system completed ahead of schedule\n\n### Action Items\n- [ ] Provide API rate limit increase to 50K calls/hour (Alex - by March 15)\n- [ ] Share security audit documentation (Alex - by March 17)\n- [ ] Schedule executive presentation for steering committee (Michael - March 20)\n\n### Decisions\n- POC extended by 2 weeks to include Provider Access API testing\n- UHG will provide production-like data set for stress testing\n\n### Risk Factors\n- Aisha raised concerns about latency at 100K+ concurrent connections\n- Need to demonstrate horizontal scaling capabilities",
      summary: "UHG POC on track with strong data quality. Extended to include Provider Access API. Scaling demo needed.",
      accountId: "acc-uhg",
      dealId: "deal-2",
      source: "agent",
      tags: ["poc", "weekly-update"],
      createdBy: USER_ID,
    },
    {
      id: "ins-4",
      type: "product_feedback",
      title: "Customer Feedback: API Documentation Improvements",
      content: "## Feedback Summary\n\nMultiple customers have requested improvements to our API documentation:\n\n1. **Interactive API Explorer**: Humana's team wants Swagger/OpenAPI interactive docs\n2. **Code Samples**: CVS requested Python and Java SDK examples\n3. **Webhook Documentation**: Centene needs better webhook event documentation\n4. **Rate Limiting**: All customers want clearer rate limit documentation\n\n### Priority Ranking\n1. Interactive API explorer (3 customers requesting)\n2. Language-specific code samples (2 customers)\n3. Webhook event catalog (2 customers)\n4. Rate limit transparency (4 customers)\n\n### Recommendation\nPrioritize rate limit documentation and interactive explorer as they affect the most customers.",
      summary: "4 customers requesting better API docs, especially rate limits and interactive explorer.",
      source: "manual",
      tags: ["product-feedback", "documentation"],
      createdBy: USER_ID,
    },
    {
      id: "ins-5",
      type: "deployment_update",
      title: "Centene Deployment Status - March 2026",
      content: "## Deployment Status: 🟢 On Track\n\n### Milestones\n| Milestone | Status | Date |\n|-----------|--------|------|\n| FHIR API Setup | ✅ Complete | Jan 15 |\n| Data Migration | ✅ Complete | Feb 1 |\n| Analytics Dashboard | ✅ Complete | Feb 20 |\n| CMS Compliance Audit | 🟡 In Progress | Mar 15 |\n| Production Go-Live | ⏳ Planned | Apr 1 |\n\n### Active Issues\n- Minor: Data mapping discrepancy for 3 Medicaid state codes (fix deployed)\n- Info: Request to add custom analytics dashboard widgets\n\n### Usage Metrics\n- API calls: 1.8M/month (trending up 15% MoM)\n- Data quality: 98.1%\n- Uptime: 99.97%\n\n### Expansion Opportunity\nRobert Martinez expressed interest in Payer-to-Payer Exchange during our last sync. Proposal sent (deal-6).",
      summary: "Centene deployment on track for April go-live. 98.1% data quality. Expansion opportunity identified.",
      accountId: "acc-centene",
      source: "agent",
      tags: ["deployment", "status-report"],
      createdBy: USER_ID,
    },
  ];

  const batch = db.batch();
  for (const insight of insights) {
    const { id, ...data } = insight;
    batch.set(db.doc(`organizations/${ORG_ID}/insights/${id}`), {
      ...data,
      createdAt: NOW,
      updatedAt: NOW,
    });
  }
  await batch.commit();
}

async function seedAgentTemplates() {
  console.log("🤖 Creating agent templates...");
  const templates = [
    { id: "tpl-1", name: "Account Research Agent", description: "Deep-dive research on prospect or customer accounts.", category: "research", icon: "🔍", isPublic: true, usageCount: 156 },
    { id: "tpl-2", name: "Meeting Prep Agent", description: "Prepares comprehensive briefing documents before customer meetings.", category: "sales", icon: "📋", isPublic: true, usageCount: 89 },
    { id: "tpl-3", name: "Competitive Intel Agent", description: "Monitors competitor activity in the healthcare interoperability space.", category: "research", icon: "🛡️", isPublic: true, usageCount: 67 },
    { id: "tpl-4", name: "Email Drafter Agent", description: "Drafts personalized follow-up emails.", category: "communication", icon: "✉️", isPublic: true, usageCount: 234 },
    { id: "tpl-5", name: "Deployment Tracker Agent", description: "Monitors active deployment progress.", category: "post_sales", icon: "🚀", isPublic: true, usageCount: 45 },
    { id: "tpl-6", name: "Expansion Opportunity Agent", description: "Identifies upsell and cross-sell opportunities.", category: "sales", icon: "📈", isPublic: true, usageCount: 78 },
    { id: "tpl-7", name: "Meeting Notes Agent", description: "Processes meeting transcripts and extracts action items.", category: "operations", icon: "📝", isPublic: true, usageCount: 312 },
    { id: "tpl-8", name: "Presentation Builder Agent", description: "Creates slide outlines and content.", category: "sales", icon: "🎯", isPublic: true, usageCount: 56 },
  ];

  const batch = db.batch();
  for (const template of templates) {
    const { id, ...data } = template;
    batch.set(db.doc(`organizations/${ORG_ID}/agentTemplates/${id}`), {
      ...data,
      systemPrompt: "See full template in application code.",
      tools: [],
      defaultIntegrations: { email: false, slack: false, drive: false, docs: false, calendar: false, browserbase: false },
      createdAt: NOW,
    });
  }
  await batch.commit();
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding 1stUp Health CRM database...\n");

  try {
    await seedOrganization();
    await seedUser();
    await seedAccounts();
    await seedContacts();
    await seedDeals();
    await seedActivities();
    await seedInsights();
    await seedAgentTemplates();

    console.log("\n✅ Seed complete! Demo data populated successfully.");
    console.log("\n📊 Summary:");
    console.log("  - 1 Organization (1stUp Health)");
    console.log("  - 1 User (Alex Rivera, VP of Sales)");
    console.log("  - 6 Accounts (CVS, UHG, Elevance, Humana, Cigna, Centene)");
    console.log("  - 10 Contacts");
    console.log("  - 8 Deals across pipeline stages");
    console.log("  - 8 Activities");
    console.log("  - 5 Insights");
    console.log("  - 8 Agent Templates");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
