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

  /**
   * List files with optional query, folder filter, and MIME type filter.
   */
  async listFiles(
    query?: string,
    folderId?: string,
    mimeType?: string
  ): Promise<DriveFile[]> {
    try {
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to list files";
      throw new Error(`Drive listFiles failed: ${message}`);
    }
  }

  /**
   * Get file metadata by ID.
   */
  async getFile(fileId: string): Promise<DriveFile | null> {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: "id, name, mimeType, size, webViewLink, createdTime, modifiedTime",
      });

      const f = response.data;
      if (!f.id) return null;

      return {
        id: f.id,
        name: f.name ?? "Untitled",
        mimeType: f.mimeType ?? undefined,
        size: f.size ?? undefined,
        webViewLink: f.webViewLink ?? undefined,
        createdTime: f.createdTime ?? undefined,
        modifiedTime: f.modifiedTime ?? undefined,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get file";
      throw new Error(`Drive getFile failed: ${message}`);
    }
  }

  /**
   * Download file content as Buffer.
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" }
      );
      return Buffer.from(response.data as ArrayBuffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to download file";
      throw new Error(`Drive downloadFile failed: ${message}`);
    }
  }

  /**
   * Upload a file to Drive.
   */
  async uploadFile(
    name: string,
    content: string | Buffer,
    mimeType: string,
    folderId?: string
  ): Promise<DriveFile> {
    try {
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload file";
      throw new Error(`Drive uploadFile failed: ${message}`);
    }
  }

  /**
   * Create a folder.
   */
  async createFolder(name: string, parentId?: string): Promise<DriveFile> {
    try {
      const fileMetadata: drive_v3.Schema$File = {
        name,
        mimeType: "application/vnd.google-apps.folder",
      };
      if (parentId) {
        fileMetadata.parents = [parentId];
      }

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: "id, name, mimeType, size, webViewLink, createdTime, modifiedTime",
      });

      const f = response.data;
      if (!f.id) throw new Error("No folder ID returned");

      return {
        id: f.id,
        name: f.name ?? name,
        mimeType: f.mimeType ?? "application/vnd.google-apps.folder",
        size: f.size ?? undefined,
        webViewLink: f.webViewLink ?? undefined,
        createdTime: f.createdTime ?? undefined,
        modifiedTime: f.modifiedTime ?? undefined,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create folder";
      throw new Error(`Drive createFolder failed: ${message}`);
    }
  }

  /**
   * Share a file with a user by email.
   * @param role - "reader" | "writer" | "commenter"
   */
  async shareFile(
    fileId: string,
    email: string,
    role: "reader" | "writer" | "commenter"
  ): Promise<void> {
    try {
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          type: "user",
          role,
          emailAddress: email,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to share file";
      throw new Error(`Drive shareFile failed: ${message}`);
    }
  }
}
