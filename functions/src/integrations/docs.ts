import { google } from "googleapis";
import type { docs_v1 } from "googleapis";

export interface GoogleDocument {
  documentId: string;
  title?: string;
  content?: string;
}

export class DocsConnector {
  private docs: docs_v1.Docs;
  private auth: docs_v1.Options["auth"];

  constructor(authClient: docs_v1.Options["auth"]) {
    this.auth = authClient;
    this.docs = google.docs({ version: "v1", auth: authClient });
  }

  async getDocument(docId: string): Promise<GoogleDocument | null> {
    const response = await this.docs.documents.get({ documentId: docId });
    const doc = response.data;

    if (!doc.documentId) return null;

    const content = this.extractTextFromDocument(doc);

    return {
      documentId: doc.documentId,
      title: doc.title ?? undefined,
      content,
    };
  }

  async createDocument(title: string, content: string): Promise<GoogleDocument> {
    const drive = google.drive({ version: "v3", auth: this.auth });
    const createResponse = await drive.files.create({
      requestBody: {
        name: title,
        mimeType: "application/vnd.google-apps.document",
      },
      media: {
        mimeType: "text/plain",
        body: content,
      },
    });

    const fileId = createResponse.data.id;
    if (!fileId) throw new Error("No document ID returned from create");

    const doc = await this.getDocument(fileId);
    if (!doc) throw new Error("Failed to fetch created document");

    return doc;
  }

  async appendToDocument(docId: string, content: string): Promise<void> {
    const doc = await this.docs.documents.get({ documentId: docId });
    const endIndex =
      doc.data.body?.content?.reduce(
        (max, el) => Math.max(max, (el.endIndex ?? 0) - 1),
        1
      ) ?? 1;

    await this.docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: endIndex },
              text: "\n" + content,
            },
          },
        ],
      },
    });
  }

  private extractTextFromDocument(doc: docs_v1.Schema$Document): string {
    const content = doc.body?.content ?? [];
    const parts: string[] = [];

    for (const element of content) {
      if (element.paragraph?.elements) {
        for (const el of element.paragraph.elements) {
          const text = el.textRun?.content;
          if (text) parts.push(text);
        }
      }
      if (element.table?.tableRows) {
        for (const row of element.table.tableRows) {
          const rowParts: string[] = [];
          for (const cell of row.tableCells ?? []) {
            const cellText = cell.content
              ?.map((c) =>
                c.paragraph?.elements
                  ?.map((e) => e.textRun?.content ?? "")
                  .join("")
              )
              .join("")
              .trim();
            if (cellText) rowParts.push(cellText);
          }
          if (rowParts.length) parts.push(rowParts.join(" | ") + "\n");
        }
      }
    }

    return parts.join("").replace(/\n$/, "");
  }
}
