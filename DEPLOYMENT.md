# Deployment Guide — Vercel

This document describes how to deploy the REMINDER Progressive Web App to Vercel with HTTPS, client-side SPA routing, and caching headers.

---

## 1. Prerequisites

- A GitHub repository with the code.
- A free Vercel account ([vercel.com](https://vercel.com)).
- A Google Cloud Project with OAuth 2.0 Credentials (for Google Drive Sync).

---

## 2. Vercel Configuration (`vercel.json`)

The project contains a pre-configured `vercel.json` optimized for Angular SPAs:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/reminder/browser",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/manifest.webmanifest",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/(reminder-sw.js|ngsw-worker.js)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

---

## 3. Environment Variables

Configure the following environment variables in your Vercel Project Settings (or directly via the app's Settings interface):

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID created in Google Cloud Console |
| `AUTHORIZED_EMAIL` | The specific Google account email allowed to access this single-user application |

*Note*: Because REMINDER is a single-user PWA, you can also paste your Google Client ID and Authorized Email directly into the **Settings** view in the application; values are saved to your local database securely.

---

## 4. Google Cloud Console Configuration

1. Visit [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project named `REMINDER-APP`.
3. Go to **APIs & Services** > **Library**, enable **Google Drive API**.
4. Go to **OAuth consent screen**:
   - User Type: **External** (in Testing mode with your email added as a Test User) or **Internal**.
   - Add scopes: `.../auth/drive.file`, `.../auth/userinfo.profile`, `.../auth/userinfo.email`.
5. Go to **Credentials** > **Create Credentials** > **OAuth client ID**:
   - Application Type: **Web application**.
   - Authorized JavaScript origins:
     - `http://localhost:4200` (for local development)
     - `https://your-app-name.vercel.app` (your Vercel production domain)
6. Copy the generated **Client ID** into REMINDER Settings.
