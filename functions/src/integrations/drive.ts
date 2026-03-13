import { google } from "googleapis";
import type { drive_v3 } from "googleapis";

export interface DriveFile {
  id: string;
  name: string;
  mimeType?: string;
  size?: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export class DriveConnector {
  private drive: drive_v3.Drive;

  constructor(authClient: drive_v3.Options["auth"]) {
    this.drive = google.drive({ version: "v3", auth: authClient });
  }

  async listFiles(
    query?: string,
    folderId?: string,
    mimeType?: string
  ): Promise<DriveFile[]> {
    const qParts: string[] = ["trashed = false"];
    if (query) qParts.push(`fullText contains '${query.replace(/'/g, "\\'")}'`);
    if (folderId) qParts.push(`'${folderId}' in parents`);
    if (mimeType) qParts.push(`mimeType = '${mimeType}'`);

    const response = await this.drive.files.list({
      q: qParts.join(" and "),
      fields: "files(id, name, mimeType, size, webViewLink, createdTime, modifiedTime)",
      pageSize: 100,
    });

    const files = response.data.files ?? [];
    return files
      .filter((f): f is drive_v3.Schema$File & { id: string } => !!f.id)
      .map((f) => ({
        id: f.id,
        name: f.name ?? "Untitled",
        mimeType: f.mimeType ?? undefined,
        size: f.size ?? undefined,
        webViewLink: f.webViewLink ?? undefined,
        createdTime: f.createdTime ?? undefined,
        modifiedTime: f.modifiedTime ?? undefined,
      }));
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    const response = await this.drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );
    return Buffer.from(response.data as ArrayBuffer);
  }

  async uploadFile(
    name: string,
    content: string | Buffer,
    mimeType: string,
    folderId?: string
  ): Promise<DriveFile> {
    const body = typeof content === "string" ? Buffer.from(content, "utf-8") : content;
    const media = { mimeType, body };

    const fileMetadata: drive_v3.Schema$File = {
      name,
      mimeType,
    };
    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, name, mimeType, size, webViewLink, createdTime, modifiedTime",
    });

    const f = response.data;
    if (!f.id) throw new Error("No file ID returned from upload");

    return {
      id: f.id,
      name: f.name ?? name,
      mimeType: f.mimeType ?? mimeType,
      size: f.size ?? undefined,
      webViewLink: f.webViewLink ?? undefined,
      createdTime: f.createdTime ?? undefined,
      modifiedTime: f.modifiedTime ?? undefined,
    };
  }
}
