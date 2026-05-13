# SmartIoT Chat

Refer to [docs/qa-procedures.md](docs/qa-procedures.md) for manual QA and auditing workflows.

SmartIoT Chat is a modern frontend-only rework of the legacy `react-chat`
project. The original idea was a simple Firebase realtime chat. This version
keeps that idea and rebuilds it with Vite, React, TypeScript, Tailwind CSS,
Firebase Auth, Firebase Realtime Database, and GitHub Pages.

It is designed as a demo chat console for lightweight technical support, small
teams, and IoT alert rooms. It has no custom backend.

## Features

- Anonymous Firebase Auth sign-in.
- Demo mode when Firebase environment variables are missing.
- Default rooms: General, Support, and IoT Alerts.
- Realtime messages with author, role, time, and plain text body.
- 500 character message limit.
- Basic online users and `lastSeenAt` presence.
- Editable display name.
- CSS initials and role badges for avatars.
- Avatar rendering uses initials or local icons only; no uploaded or remote images.
- Responsive chat layout with room sidebar, message area, online panel, and
  mobile-friendly room navigation.
- GitHub Pages deployment workflow.
- Local-only attachments via IndexedDB (images: png, jpg, webp, gif;
  documents: pdf, txt, csv, json; max 5 MB per file, 5 per message).
- Attachment metadata stored in Firebase Realtime Database in Firebase mode.

## Explicit Non-Goals

- No Firebase Storage.
- No remote avatar images required.
- No backend server.
- No backend server.
- No Docker.

## Prerequisites

- **Node.js >= 22** (the version used in CI)
- **npm >= 10**

An `.nvmrc` is provided — run `nvm use` if you use `nvm`.

## Screenshots

Add screenshots here after deploying or running locally:

- Desktop chat view: `docs/screenshots/desktop.png`
- Mobile chat view: `docs/screenshots/mobile.png`

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Firebase Auth
- Firebase Realtime Database
- GitHub Actions
- GitHub Pages

## Install

```bash
npm ci
npm run dev
```

Use `npm ci` for fresh clones to match CI (it uses the lockfile). Use `npm install` if you intentionally want to update dependencies.

Open the URL printed by Vite.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm test
```

CI runs `lint`, `test`, and `build` before every deployment.

## Firebase Setup

Create `.env` from `.env.example` and fill in the Firebase web app values:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

Then enable Anonymous sign-in in Firebase Authentication and create a Realtime
Database.

Recommended database rules are documented in
[`docs/firebase-rules.md`](docs/firebase-rules.md).

## Demo Mode

If any Firebase variable is missing, SmartIoT Chat runs in demo mode. Demo mode
uses mock rooms, seeded messages, simulated online users, and `localStorage`.

This means anyone can clone the repo, run `npm install && npm run dev`, and see
the UI without creating a Firebase project.

## GitHub Pages Deploy

The Vite base path is configured for this repository:

```ts
base: '/react-chat/'
```

The workflow lives at `.github/workflows/deploy.yml`.

To activate deployment:

1. Push the repo to GitHub.
2. Open repository settings.
3. Go to Pages.
4. Set Source to GitHub Actions.
5. Run the deploy workflow or push to `main`/`master`.

## Data Model

```ts
type ChatUser = {
  uid: string
  displayName: string
  role: 'guest' | 'technician' | 'admin' | 'sensor'
  createdAt: number
  lastSeenAt: number
}

type Room = {
  id: string
  name: string
  description: string
  icon: string
  createdAt: number
}

type Message = {
  id: string
  roomId: string
  userId: string
  userName: string
  userRole: ChatUser['role']
  text: string
  createdAt: number
  attachments?: AttachmentRef[]
}

type AttachmentRef = {
  id: string
  name: string
  mimeType: string
  size: number
  storage: 'indexeddb'
  localOnly: true
  createdAt: number
}
```

## Roadmap

- Optional Google sign-in once provider setup is desired.
- Room creation UI.
- Message search.
- Role management.
- Better presence expiration for inactive browser tabs.


## Legacy Rework Notes

This project intentionally replaces the old React 16, Webpack 4, Babel 6, and
Firebase 6 implementation. The goal is a clean modern demo, not a line-by-line
migration.
