# SmartIoT Chat

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
- Upload controls are disabled by design; no files, images, blobs, or attachments are stored.
- Responsive chat layout with room sidebar, message area, online panel, and
  mobile-friendly room navigation.
- GitHub Pages deployment workflow.

## Explicit Non-Goals

- No Firebase Storage.
- No image uploads.
- No file uploads.
- No attachments.
- No remote avatar images required.
- No backend server.
- No Docker.

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
npm install
npm run dev
```

Open the URL printed by Vite.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

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
}
```

## Roadmap

- Optional Google sign-in once provider setup is desired.
- Room creation UI.
- Message search.
- Role management.
- Better presence expiration for inactive browser tabs.
- Lightweight automated UI tests.

## Legacy Rework Notes

This project intentionally replaces the old React 16, Webpack 4, Babel 6, and
Firebase 6 implementation. The goal is a clean modern demo, not a line-by-line
migration.
