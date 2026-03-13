import { google } from "googleapis";
import type { gmail_v1 } from "googleapis";

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  body?: string;
}

export class GmailConnector {
  private gmail: gmail_v1.Gmail;

  constructor(authClient: gmail_v1.Options["auth"]) {
    this.gmail = google.gmail({ version: "v1", auth: authClient });
  }

  async listEmails(query: string, maxResults = 20): Promise<GmailMessage[]> {
    const response = await this.gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults,
    });

    const messages = response.data.messages ?? [];
    const results: GmailMessage[] = [];

    for (const msg of messages) {
      if (msg.id) {
        const full = await this.getEmail(msg.id);
        if (full) results.push(full);
      }
    }

    return results;
  }

  private async getEmail(messageId: string): Promise<GmailMessage | null> {
    const response = await this.gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    const msg = response.data;
    if (!msg.id || !msg.threadId) return null;

    const headers = msg.payload?.headers ?? [];
    const getHeader = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value;

    let body = "";
    if (msg.payload?.body?.data) {
      body = Buffer.from(msg.payload.body.data, "base64").toString("utf-8");
    } else if (msg.payload?.parts) {
      const textPart = msg.payload.parts.find(
        (p) => p.mimeType === "text/plain" || p.mimeType === "text/html"
      );
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
      }
    }

    return {
      id: msg.id,
      threadId: msg.threadId,
      labelIds: msg.labelIds ?? undefined,
      snippet: msg.snippet ?? undefined,
      subject: getHeader("Subject") ?? undefined,
      from: getHeader("From") ?? undefined,
      to: getHeader("To") ?? undefined,
      date: getHeader("Date") ?? undefined,
      body: body || undefined,
    };
  }

  async sendEmail(to: string, subject: string, body: string): Promise<string> {
    const raw = this.createRawMessage("me", to, subject, body);
    const response = await this.gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });
    return response.data.id ?? "";
  }

  async draftEmail(to: string, subject: string, body: string): Promise<string> {
    const raw = this.createRawMessage("me", to, subject, body);
    const response = await this.gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: { raw },
      },
    });
    return response.data.id ?? "";
  }

  private createRawMessage(
    from: string,
    to: string,
    subject: string,
    body: string
  ): string {
    const lines = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=utf-8",
      "",
      body.replace(/\n/g, "<br>"),
    ];
    return Buffer.from(lines.join("\r\n")).toString("base64url");
  }
}
