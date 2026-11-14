# REMINDER — Personal Offline-First PWA

A private, production-quality Personal Reminder Progressive Web App (PWA) with dual Nepali Bikram Sambat (BS) & English Gregorian (AD) calendar support, local IndexedDB storage, Google OAuth 2.0 authentication, background Google Drive cloud synchronization, and Web Notifications.

![REMINDER PWA Architecture](https://img.shields.io/badge/Architecture-Offline--First-indigo?style=for-the-badge)
![Angular](https://img.shields.io/badge/Angular-20-dd0031?style=for-the-badge&logo=angular)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Dexie.js](https://img.shields.io/badge/IndexedDB-Dexie.js%20v4-10b981?style=for-the-badge)
![Google Drive](https://img.shields.io/badge/Cloud%20Sync-Google%20Drive%20v3-4285F4?style=for-the-badge&logo=googledrive)

---

## 🌟 Key Features

- **📱 Mobile-First & Offline-First**: Built with responsive mobile bottom navigation, desktop persistent sidebar, and 100% offline functionality. Task creation, completion, snoozing, and local notifications never block on internet connectivity or external APIs.
- **🇳🇵 Dual Calendar Engine (BS ↔ AD)**: Seamless Bikram Sambat (BS) and Gregorian (AD) date conversions with real Nepalese festival integration (Dashain, Tihar, Teej, Holi, Buddha Jayanti, Shivaratri, etc.) and BS yearly recurrence (e.g. 15 Bhadra every year).
- **🔔 Notification Alert Engine**: Multi-alert scheduling (7 days before, 1 day before, 15 min before, at deadline), background offline heartbeat inspection (20s interval), Service Worker background actions (`Complete` and `Snooze`), synthetic Web Audio bell chime, and haptic vibration.
- **☁️ Google Drive Cloud Sync & Attachments**: Background delta sync via Dexie `syncQueue` table to `REMINDER_APP/data/`, binary attachment storage in `REMINDER_APP/attachments/` (`images/`, `documents/`, `bills/`), and timestamp-based conflict resolution with a side-by-side conflict dialog.
- **🎂 Birthdays & Anniversaries**: Milestone age countdown ("5 days left", "Today! 🎂", "Turning 30"), support for both BS and AD birthdates, and relationship tags.
- **📅 Events & Meetings**: Multi-day scheduling with start/end dates and times, locations, and recurrence.
- **🌐 Dual-Language Support**: Instant switching between English and Nepali (नेपाली) with optional Devanagari numerals (`०-९`).
- **🔍 Omnibar Global Search**: Unified search across Reminders, Events, Birthdays, and Festivals (`⌘K` / `Ctrl+K`).
- **⚡ Natural Language Quick-Add & Voice Dictation**: Parse free-form sentences (e.g. *"Pay electricity bill Rs 1500 tomorrow at 6pm @home urgent"*) into structured reminders with auto-detected dates, times, categories, priorities, amounts, and context tags. Hands-free speech-to-text input via the Web Speech API.
- **🌕 Tithi & Vedic Panchanga**: Live lunar phase calculations (Ekadashi, Purnima 🌕, Aunsi/Amavasya 🌑, and Sankranti) integrated directly into calendar cells.
- **🇳🇵 Gazetted Public Holiday Filters & Printable Calendar**: One-click filter for government holidays and clean `@media print` layout for physical A4 printing of monthly BS calendars.
- **☑️ Subtasks & Dynamic Checklists**: Break down complex reminders into subtasks with real-time completion progress meters.
- **🏷️ Context Tags & Bill Tracking**: Tag reminders with `@home`, `@office`, `@market`, `@clinic`, `@bank` and forecast monthly expenses (Total Due, Paid, Pending) on the dashboard.
- **🔔 Authentic Synthesized Audio Chimes**: Web Audio synthesized chime options including Tibetan Temple Bell, Himalayan Singing Bowl (432Hz), and Digital Arp without external audio asset bloat.
- **📱 PWA Shortcuts & Web Share Target**: Quick-launch actions from home screen and share URLs or text directly into REMINDER from other apps.
- **🧹 Storage Management**: Purge cloud-backed local attachment blobs and auto-archive completed reminders older than 6 months.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
git clone https://github.com/username/reminder.git
cd reminder
npm install
```

### Development Server
```bash
npm start
```
Navigate to `http://localhost:4200/`. The app will automatically reload on code changes.

### Production Build
```bash
npm run build
```
Compiled artifacts are output to `dist/reminder`.

---

## 🏗️ Architecture Summary

```
                      ┌──────────────────────┐
                      │      VERCEL          │
                      │   Angular 20 PWA     │
                      └──────────┬───────────┘
                                 │
                  ┌──────────────┴──────────────┐
                  │                             │
           ┌──────▼──────┐              ┌──────▼──────┐
           │  IndexedDB  │              │   Google    │
           │  Dexie.js   │◄─── Sync ───►│  Drive API  │
           └──────┬──────┘              └─────────────┘
                  │
       ┌──────────┴───────────┐
       │                      │
┌──────▼─────────┐   ┌────────▼───────┐
│ Reminder Engine│   │   Attachment   │
│                │   │    Manager     │
└──────┬─────────┘   └────────────────┘
       │
┌──────▼─────────┐
│ Service Worker │
│  Notification  │
│  Alert Daemon  │
└──────┬─────────┘
       │
       ▼
    📱 Mobile / Desktop
```

---

## 📖 Complete Documentation Suite

- [Architecture Guide](ARCHITECTURE.md)
- [Database Schema (IndexedDB / Dexie)](DATABASE.md)
- [Google Drive Sync & Conflict Resolution](GOOGLE_DRIVE_SYNC.md)
- [Notification Engine & Service Worker](NOTIFICATIONS.md)
- [Bikram Sambat (BS) Dual Calendar](CALENDAR.md)
- [Deployment Guide (Vercel)](DEPLOYMENT.md)
- [Security & Privacy](SECURITY.md)

---

## 📄 License
Private Personal Use Application. All rights reserved.
