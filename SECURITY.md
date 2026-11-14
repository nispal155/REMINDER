# Security & Privacy Guide — REMINDER

This document outlines the security architecture, authentication boundaries, token handling, and local storage protections in the REMINDER application.

---

## 1. Single-User Private Authorization Guard

REMINDER is designed as a personal private productivity tool. It does not use a shared multi-tenant database.

### Owner Validation
When any Google account authenticates:
```typescript
const userInfo = await this.fetchUserProfile(accessToken);
const allowedEmail = this.getAuthorizedEmail();

if (allowedEmail && userInfo.email.toLowerCase() !== allowedEmail.toLowerCase()) {
  // Revoke token immediately
  google.accounts.oauth2.revoke(accessToken);
  // Log out and terminate session
  this.logout();
  throw new Error(`Access restricted: ${userInfo.email} is not the authorized owner.`);
}
```
If an unauthorized Google account attempts sign-in on your device, their session token is immediately revoked with Google and discarded locally.

---

## 2. Principle of Least Privilege: Google Drive Scopes

The application **never** requests full Google Drive access (`https://www.googleapis.com/auth/drive`).

Instead, it strictly requests the scoped per-file permission:
- `https://www.googleapis.com/auth/drive.file`:
  - Grants access **only** to files and folders created by the REMINDER app.
  - The application cannot see, read, modify, or delete any other documents, sheets, photos, or files in your Google Drive.

---

## 3. Local Storage & IndexedDB Isolation

- **Browser Origin Sandbox**: All IndexedDB databases (`ReminderDatabase`) and local storage keys are bound to your secure origin domain (`https://your-domain.vercel.app` or `http://localhost:4200`). Other websites cannot read your reminder data or attachments.
- **Attachment File Guards**:
  - File size restricted to a safe maximum (e.g. 15MB).
  - Dangerous executable MIME types (`.exe`, `.bat`, `.sh`, `.vbs`) are rejected.
  - Files are rendered through standard sanitized object URLs (`URL.createObjectURL`).

---

## 4. XSS & Content Security

- **Angular Sanitization**: Angular natively escapes all dynamic template interpolations, preventing Cross-Site Scripting (XSS).
- **No `eval` or Unsafe Inline Execution**: All calendar arithmetic and JSON parsing use safe standard JavaScript parsers.

