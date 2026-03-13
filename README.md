# 1stUp Health CRM — AI-Powered Sales Intelligence

> CRM platform for 1stUp Health with autonomous AI agents for healthcare sales, post-sales, and customer success.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Storage-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38BDF8)

## Features

### CRM Core
- **Accounts** — Track healthcare companies (payers, health plans, MCOs) with stage management
- **Contacts** — Manage stakeholders with role-based tagging and activity tracking
- **Deals Pipeline** — Kanban board + table view with 7-stage pipeline, 1stUp Health products pre-loaded
- **Activities** — Timeline-based activity tracking (calls, emails, meetings, notes, tasks)
- **Documents** — File management with Firebase Storage integration
- **Insights** — AI-generated and manual insights with markdown rendering

### AI Agents
- **8 Pre-built Templates**: Account Research, Meeting Prep, Competitive Intel, Email Drafter, Deployment Tracker, Expansion Opportunity, Meeting Notes, Presentation Builder
- **Agent Builder Wizard** — 6-step flow: template → persona → tools → context → schedule → review
- **21 Agent Tools**: Web search, Browserbase browsing, CRM CRUD, Gmail, Google Drive, Google Docs, Calendar, Slack
- **Real-time Execution** — Firestore snapshots for live progress tracking
- **Chat Interface** — Interactive conversations with AI agents
- **Scheduled Runs** — Cron-based autonomous execution on Cloud Functions v2

### Google Workspace Integration
- **Gmail** — Search emails, send/draft messages, thread analysis
- **Google Drive** — File search, upload, download, sharing
- **Google Docs** — Read, create, append, export as markdown/PDF
- **Google Calendar** — Event management, free slot finding
- **Slack** — Channel monitoring, message search, posting

### Advanced Features
- **Command Palette** (⌘K) — Search across accounts, agents, navigation
- **Notifications** — Agent completions, deal changes, task reminders
- **Dashboard Analytics** — Pipeline charts, KPI cards, activity feeds
- **Dark Mode** — Full theme support with next-themes
- **Product Knowledge Base** — 10 1stUp Health products with features, buyers, compliance info
- **Buyer Personas** — 5 healthcare executive profiles for personalized outreach

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Server Components) |
| **Language** | TypeScript 5 (strict mode) |
| **Auth** | Firebase Auth + next-firebase-auth-edge |
| **Database** | Cloud Firestore (multi-tenant) |
| **Storage** | Firebase Storage |
| **Functions** | Firebase Cloud Functions v2 (Cloud Run) |
| **AI** | OpenAI GPT-4o (Responses API + tool calling) |
| **Browser Automation** | Browserbase (HIPAA-compliant) |
| **UI Components** | shadcn/ui + Radix UI + Tailwind CSS 4 |
| **Charts** | Recharts |
| **Tables** | TanStack Table |
| **Forms** | React Hook Form + Zod |
| **Google APIs** | googleapis (Gmail, Drive, Docs, Calendar) |
| **Slack** | @slack/web-api |

## Getting Started

### Prerequisites
- Node.js 20+
- Firebase project with Auth, Firestore, Storage enabled
- OpenAI API key
- (Optional) Browserbase account
- (Optional) Google OAuth credentials
- (Optional) Slack app credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/bill-olive/personal-crm.git
cd personal-crm

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your Firebase and API credentials

# Run development server
npm run dev
```

### Firebase Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and select project
firebase login
firebase use --add

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy Cloud Functions
cd functions && npm install && cd ..
firebase deploy --only functions
```

### Seed Demo Data

```bash
# With Firebase emulator
npx ts-node scripts/seed.ts

# With production Firestore (set env vars first)
FIREBASE_PROJECT_ID=your-project \
FIREBASE_CLIENT_EMAIL=your-email \
FIREBASE_PRIVATE_KEY="your-key" \
npx ts-node scripts/seed.ts
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Signup pages
│   ├── dashboard/       # Protected dashboard pages
│   │   ├── accounts/    # Account CRUD + detail
│   │   ├── contacts/    # Contact management
│   │   ├── deals/       # Pipeline (Kanban + Table)
│   │   ├── activities/  # Activity timeline
│   │   ├── documents/   # Document library
│   │   ├── insights/    # Insight feed + detail
│   │   ├── agents/      # Agent gallery, builder, chat, runs
│   │   └── settings/    # Profile, org, integrations, API keys
│   └── layout.tsx       # Root layout
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Sidebar, Header, CommandSearch, Notifications
│   ├── shared/          # DataTable, PageHeader, EmptyState, StatusBadge
│   └── charts/          # Pipeline chart
├── lib/
│   ├── firebase/        # Client + Admin SDK
│   ├── auth/            # Auth context + server helpers
│   ├── db/              # Firestore schemas
│   ├── actions/         # Server actions (CRUD)
│   ├── integrations/    # Gmail, Drive, Docs, Calendar, Slack connectors
│   ├── agents/          # Agent templates + tool definitions
│   └── knowledge/       # Product catalog + buyer personas
functions/
├── src/
│   ├── agent/           # Executor, tools, context builder
│   ├── integrations/    # Server-side connectors
│   └── index.ts         # Cloud Function entry points
scripts/
└── seed.ts              # Demo data seeder
```

## Firestore Data Model

```
organizations/{orgId}
├── accounts/{accountId}
├── contacts/{contactId}
├── deals/{dealId}
├── activities/{activityId}
├── documents/{documentId}
├── insights/{insightId}
├── agents/{agentId}
│   └── messages/{messageId}
├── agentRuns/{runId}
├── agentTemplates/{templateId}
└── integrationTokens/{service}

users/{uid}
└── notifications/{notifId}
```

## 1stUp Health Products

The CRM comes pre-loaded with 1stUp Health's product portfolio:
1. FHIR API Platform
2. Electronic Prior Authorization
3. Payer-to-Payer Data Exchange
4. Provider Access API
5. Patient Access Portal
6. Provider Directory
7. Formulary Management
8. Analytics & Reporting
9. Member Data Lakehouse
10. CMS Compliance Suite

## License

Private — 1stUp Health internal use only.
