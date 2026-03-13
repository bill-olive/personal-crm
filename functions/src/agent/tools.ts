import type { ChatCompletionTool } from "openai/resources/chat/completions";

/**
 * All 21 agent tools as OpenAI function calling definitions.
 * Grouped by category: research, crm, communication, calendar, drive, docs.
 */
export const ALL_TOOL_DEFINITIONS: ChatCompletionTool[] = [
  // ─── Research ─────────────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the web for real-time information. Use for company research, news, competitive intelligence, and current events.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query",
          },
          maxResults: {
            type: "number",
            description: "Maximum number of results to return (default 10)",
            default: 10,
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browserbase_navigate",
      description: "Navigate to a web page using Browserbase. Use when you need to visit a specific URL to extract content.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL to navigate to",
          },
        },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browserbase_extract",
      description: "Extract text content from the current web page in Browserbase. Call after browserbase_navigate.",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "Optional CSS selector to extract specific element. Omit to extract full page.",
          },
        },
      },
    },
  },
  // ─── CRM ─────────────────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "crm_read",
      description: "Read CRM data: accounts, contacts, deals, activities, insights, or documents. Specify which entity type and optionally filter by IDs.",
      parameters: {
        type: "object",
        properties: {
          entity: {
            type: "string",
            enum: ["accounts", "contacts", "deals", "activities", "insights", "documents"],
            description: "The CRM entity type to read",
          },
          ids: {
            type: "array",
            items: { type: "string" },
            description: "Optional list of IDs to fetch. Omit to list all (or filtered).",
          },
          accountId: {
            type: "string",
            description: "Filter by account ID (for contacts, deals, activities)",
          },
          dealId: {
            type: "string",
            description: "Filter by deal ID (for activities, insights)",
          },
        },
        required: ["entity"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "crm_write_activity",
      description: "Create an activity record (call, email, meeting, note, or task) in the CRM.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["call", "email", "meeting", "note", "task"],
            description: "Activity type",
          },
          subject: {
            type: "string",
            description: "Subject or title of the activity",
          },
          description: {
            type: "string",
            description: "Optional description or notes",
          },
          accountId: { type: "string", description: "Related account ID" },
          contactId: { type: "string", description: "Related contact ID" },
          dealId: { type: "string", description: "Related deal ID" },
          dueDate: {
            type: "string",
            description: "ISO date for tasks (e.g. 2025-03-15)",
          },
          ownerId: {
            type: "string",
            description: "User ID of the owner (required)",
          },
        },
        required: ["type", "subject", "ownerId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "crm_write_insight",
      description: "Save a research finding, analysis, or insight to the CRM.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: [
              "meeting_notes",
              "research",
              "competitive_intel",
              "product_feedback",
              "deployment_update",
              "expansion_opportunity",
            ],
            description: "Insight type",
          },
          title: { type: "string", description: "Title of the insight" },
          content: {
            type: "string",
            description: "Full content in markdown",
          },
          summary: {
            type: "string",
            description: "Optional short summary",
          },
          accountId: { type: "string", description: "Related account ID" },
          dealId: { type: "string", description: "Related deal ID" },
          contactId: { type: "string", description: "Related contact ID" },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Optional tags",
          },
          createdBy: {
            type: "string",
            description: "User ID who created this (required)",
          },
        },
        required: ["type", "title", "content", "createdBy"],
      },
    },
  },
  // ─── Communication (Email) ──────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "email_search",
      description: "Search Gmail for emails matching a query. Use for finding relevant threads with contacts or topics.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Gmail search query (e.g. from:user@example.com, subject:meeting)",
          },
          maxResults: {
            type: "number",
            description: "Max emails to return (default 20)",
            default: 20,
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "email_draft",
      description: "Create a draft email for user review. Does not send automatically.",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string", description: "Recipient email address" },
          subject: { type: "string", description: "Email subject" },
          body: {
            type: "string",
            description: "Email body (HTML or plain text)",
          },
        },
        required: ["to", "subject", "body"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "email_send",
      description: "Send an email immediately. Use with caution; prefer email_draft for user review when possible.",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string", description: "Recipient email address" },
          subject: { type: "string", description: "Email subject" },
          body: {
            type: "string",
            description: "Email body (HTML or plain text)",
          },
        },
        required: ["to", "subject", "body"],
      },
    },
  },
  // ─── Calendar ────────────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "calendar_list",
      description: "List calendar events in a time range.",
      parameters: {
        type: "object",
        properties: {
          timeMin: {
            type: "string",
            description: "Start of range (ISO 8601, e.g. 2025-03-13T00:00:00Z)",
          },
          timeMax: {
            type: "string",
            description: "End of range (ISO 8601)",
          },
          query: {
            type: "string",
            description: "Optional search query",
          },
        },
        required: ["timeMin", "timeMax"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calendar_create",
      description: "Create a new calendar event.",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string", description: "Event title" },
          start: {
            type: "string",
            description: "Start time (ISO 8601)",
          },
          end: {
            type: "string",
            description: "End time (ISO 8601)",
          },
          attendees: {
            type: "array",
            items: { type: "string" },
            description: "Attendee email addresses",
          },
          description: {
            type: "string",
            description: "Optional event description",
          },
        },
        required: ["summary", "start", "end"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calendar_find_slots",
      description: "Find free time slots for given attendees within a date range.",
      parameters: {
        type: "object",
        properties: {
          attendeeEmails: {
            type: "array",
            items: { type: "string" },
            description: "Emails to check availability for",
          },
          durationMinutes: {
            type: "number",
            description: "Duration of the meeting in minutes",
          },
          dateRangeStart: {
            type: "string",
            description: "Start of search range (ISO 8601)",
          },
          dateRangeEnd: {
            type: "string",
            description: "End of search range (ISO 8601)",
          },
        },
        required: ["attendeeEmails", "durationMinutes", "dateRangeStart", "dateRangeEnd"],
      },
    },
  },
  // ─── Drive ────────────────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "drive_search",
      description: "Search Google Drive for files and documents.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query (searches file names and content)",
          },
          folderId: {
            type: "string",
            description: "Optional folder ID to limit search",
          },
          mimeType: {
            type: "string",
            description: "Optional MIME type filter (e.g. application/vnd.google-apps.document)",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "drive_download",
      description: "Download a file from Google Drive by file ID.",
      parameters: {
        type: "object",
        properties: {
          fileId: {
            type: "string",
            description: "Google Drive file ID",
          },
        },
        required: ["fileId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "drive_upload",
      description: "Upload a file to Google Drive.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "File name" },
          content: {
            type: "string",
            description: "File content (text) or base64 for binary",
          },
          mimeType: {
            type: "string",
            description: "MIME type (e.g. text/plain, application/pdf)",
          },
          folderId: {
            type: "string",
            description: "Optional parent folder ID",
          },
        },
        required: ["name", "content", "mimeType"],
      },
    },
  },
  // ─── Docs ─────────────────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "docs_read",
      description: "Read content from a Google Doc by document ID.",
      parameters: {
        type: "object",
        properties: {
          documentId: {
            type: "string",
            description: "Google Docs document ID",
          },
        },
        required: ["documentId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "docs_create",
      description: "Create a new Google Doc with title and content.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Document title" },
          content: {
            type: "string",
            description: "Initial document content",
          },
        },
        required: ["title", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "docs_append",
      description: "Append content to an existing Google Doc.",
      parameters: {
        type: "object",
        properties: {
          documentId: {
            type: "string",
            description: "Google Docs document ID",
          },
          content: {
            type: "string",
            description: "Content to append",
          },
        },
        required: ["documentId", "content"],
      },
    },
  },
  // ─── Slack ────────────────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "slack_search",
      description: "Search Slack messages across the workspace.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query",
          },
          count: {
            type: "number",
            description: "Max results (default 20)",
            default: 20,
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "slack_post",
      description: "Post a message to a Slack channel.",
      parameters: {
        type: "object",
        properties: {
          channel: {
            type: "string",
            description: "Channel ID or channel name (e.g. C12345 or #general)",
          },
          text: {
            type: "string",
            description: "Message text",
          },
        },
        required: ["channel", "text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "slack_list_channels",
      description: "List Slack channels the bot has access to.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

/**
 * Get OpenAI tool definitions for a subset of enabled tools.
 */
export function getToolDefinitions(enabledTools: string[]): ChatCompletionTool[] {
  if (enabledTools.length === 0) {
    return [];
  }
  const set = new Set(enabledTools);
  return ALL_TOOL_DEFINITIONS.filter((t) => t.type === "function" && set.has(t.function.name));
}
