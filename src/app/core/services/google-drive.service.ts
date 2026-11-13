import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { DriveFolderStructure, AttachmentCategory } from '../models/sync.model';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {
  private readonly authService = inject(AuthService);
  private cachedFolders: DriveFolderStructure = {};

  private getHeaders(): HeadersInit {
    const token = this.authService.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated with Google Drive. Please sign in.');
    }
    return {
      Authorization: `Bearer ${token}`
    };
  }

  /**
   * Initializes and caches the entire REMINDER_APP folder structure.
   */
  async initFolderStructure(): Promise<DriveFolderStructure> {
    if (this.cachedFolders.appRootId && this.cachedFolders.dataFolderId) {
      return this.cachedFolders;
    }

    // 1. Root folder
    const appRootId = await this.getOrCreateFolder('REMINDER_APP');
    
    // 2. Main subfolders
    const dataFolderId = await this.getOrCreateFolder('data', appRootId);
    const attachmentsFolderId = await this.getOrCreateFolder('attachments', appRootId);
    const backupsFolderId = await this.getOrCreateFolder('backups', appRootId);

    // 3. Attachments subfolders
    const imagesFolderId = await this.getOrCreateFolder('images', attachmentsFolderId);
    const documentsFolderId = await this.getOrCreateFolder('documents', attachmentsFolderId);
    const billsFolderId = await this.getOrCreateFolder('bills', attachmentsFolderId);

    this.cachedFolders = {
      appRootId,
      dataFolderId,
      attachmentsFolderId,
      imagesFolderId,
      documentsFolderId,
      billsFolderId,
      backupsFolderId
    };

    return this.cachedFolders;
  }

  /**
   * Finds existing folder or creates it if not found.
   */
  async getOrCreateFolder(name: string, parentId?: string): Promise<string> {
    const existing = await this.findFile(name, 'application/vnd.google-apps.folder', parentId);
    if (existing) {
      return existing.id;
    }

    const metadata: { name: string; mimeType: string; parents?: string[] } = {
      name,
      mimeType: 'application/vnd.google-apps.folder'
    };
    if (parentId) {
      metadata.parents = [parentId];
    }

    const res = await fetch(`${DRIVE_API_BASE}/files`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to create Drive folder '${name}': ${err}`);
    }

    const data = await res.json();
    return data.id;
  }

  /**
   * Finds a single file/folder matching name, mimeType, and optional parentId.
   */
  async findFile(name: string, mimeType?: string, parentId?: string): Promise<DriveFileItem | null> {
    let query = `name = '${name.replace(/'/g, "\\'")}' and trashed = false`;
    if (mimeType) {
      query += ` and mimeType = '${mimeType}'`;
    }
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,modifiedTime)&spaces=drive`;
    const res = await fetch(url, { headers: this.getHeaders() });

    if (!res.ok) {
      throw new Error(`Failed to find file '${name}': HTTP ${res.status}`);
    }

    const data = await res.json();
    return (data.files && data.files.length > 0) ? data.files[0] : null;
  }

  /**
   * List files in a parent folder.
   */
  async listFiles(parentId: string, pageSize = 100): Promise<DriveFileItem[]> {
    const query = `'${parentId}' in parents and trashed = false`;
    const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,modifiedTime)&pageSize=${pageSize}&orderBy=modifiedTime desc`;
    const res = await fetch(url, { headers: this.getHeaders() });

    if (!res.ok) {
      throw new Error(`Failed to list files: HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.files || [];
  }

  /**
   * Uploads or updates a JSON file using multipart upload.
   */
  async uploadJsonFile(fileName: string, content: unknown, parentId: string): Promise<string> {
    const existing = await this.findFile(fileName, 'application/json', parentId);
    const jsonStr = JSON.stringify(content, null, 2);

    if (existing) {
      // Update file content
      const url = `${DRIVE_UPLOAD_BASE}/files/${existing.id}?uploadType=media`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: jsonStr
      });

      if (!res.ok) {
        throw new Error(`Failed to update JSON file '${fileName}': HTTP ${res.status}`);
      }

      return existing.id;
    } else {
      // Create new file via multipart
      return await this.createMultipartFile(fileName, 'application/json', jsonStr, parentId);
    }
  }

  /**
   * Downloads and parses a JSON file from Drive by ID.
   */
  async downloadJsonFile<T>(fileId: string): Promise<T> {
    const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
      headers: this.getHeaders()
    });

    if (!res.ok) {
      throw new Error(`Failed to download JSON file ID '${fileId}': HTTP ${res.status}`);
    }

    return await res.json();
  }

  /**
   * Uploads a binary media/document file to an appropriate attachments subfolder.
   */
  async uploadAttachment(
    fileName: string,
    fileBlob: Blob,
    mimeType: string,
    category: AttachmentCategory
  ): Promise<string> {
    const folders = await this.initFolderStructure();
    let targetFolderId = folders.documentsFolderId!;

    if (category === 'images') {
      targetFolderId = folders.imagesFolderId!;
    } else if (category === 'bills') {
      targetFolderId = folders.billsFolderId!;
    }

    return await this.createMultipartMedia(fileName, mimeType, fileBlob, targetFolderId);
  }

  /**
   * Downloads a binary file as a Blob.
   */
  async downloadBinaryFile(fileId: string): Promise<Blob> {
    const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
      headers: this.getHeaders()
    });

    if (!res.ok) {
      throw new Error(`Failed to download binary file ID '${fileId}': HTTP ${res.status}`);
    }

    return await res.blob();
  }

  /**
   * Deletes a file by ID.
   */
  async deleteFile(fileId: string): Promise<void> {
    const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!res.ok && res.status !== 404) {
      throw new Error(`Failed to delete file '${fileId}': HTTP ${res.status}`);
    }
  }

  // Internal multipart builder for text/JSON
  private async createMultipartFile(
    fileName: string,
    mimeType: string,
    content: string,
    parentId: string
  ): Promise<string> {
    const boundary = '-------ReminderAppBoundary' + Date.now();
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: fileName,
      mimeType,
      parents: [parentId]
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      content +
      closeDelimiter;

    const res = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Multipart file upload failed: ${err}`);
    }

    const data = await res.json();
    return data.id;
  }

  // Internal multipart builder for binary blobs
  private async createMultipartMedia(
    fileName: string,
    mimeType: string,
    fileBlob: Blob,
    parentId: string
  ): Promise<string> {
    const boundary = '-------ReminderAppMediaBoundary' + Date.now();
    const metadata = {
      name: fileName,
      mimeType,
      parents: [parentId]
    };

    const metadataPart = new Blob(
      [
        `--${boundary}\r\n`,
        'Content-Type: application/json; charset=UTF-8\r\n\r\n',
        JSON.stringify(metadata),
        `\r\n--${boundary}\r\n`,
        `Content-Type: ${mimeType}\r\n\r\n`
      ],
      { type: 'text/plain' }
    );

    const closeDelimiter = new Blob([`\r\n--${boundary}--`], { type: 'text/plain' });
    const fullBody = new Blob([metadataPart, fileBlob, closeDelimiter]);

    const res = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: fullBody
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Media upload failed: ${err}`);
    }

    const data = await res.json();
    return data.id;
  }
}
