# AGENTS.md

Guidance for agents working in this repository.

## Project

SmartIoT Chat is a frontend-only realtime chat demo for technical support,
small teams, and IoT alerts.

This repository is a modern rework of a legacy React chat app. Do not preserve
legacy React 16/Webpack/Babel patterns.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Firebase Auth
- Firebase Realtime Database
- GitHub Pages
- GitHub Actions
- `lucide-react` for icons
- `framer-motion` for UI transitions

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

Use `npm run lint` and `npm run build` before saying work is complete.

## Hard Constraints

- No backend server.
- No Docker.
- No payments.
- No Firebase Storage.
- No remote avatar images.
- No `dangerouslySetInnerHTML`.
- Render message text as plain text only.
- Keep message text limited to 500 characters (or empty when only attachments).
- Attachments stored in IndexedDB, never as base64 in Firebase or Realtime Database.
- Allowed attachment types: png, jpg, jpeg, webp, gif, pdf, txt, csv, json.
- Max file size per attachment: 5 MB.
- Keep demo mode working when Firebase env vars are missing.

## Firebase

Use Firebase modular SDK only.

Allowed Firebase products:

- Firebase Auth
- Firebase Realtime Database

Do not add Firestore unless there is a strong, documented technical reason.
Do not add Storage.

Firebase config comes from Vite env vars:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

Rules documentation lives in `docs/firebase-rules.md`.

## Demo Mode

If any Firebase env var is missing, the app must still run using mock data and
`localStorage`.

Demo mode is not optional. It is required so the UI can be reviewed after a
fresh clone without Firebase setup.

## Architecture

Main source layout:

```text
src/
  app/
  features/
    auth/
    chat/
      components/
      hooks/
      services/
  lib/
  mocks/
  styles/
```

Keep feature code inside `src/features`. Keep Firebase/env helpers inside
`src/lib`. Keep seeded demo data inside `src/mocks`.

## UI Direction

Current UI target is dark premium chat console:

- Deep navy/ink background.
- Glass panels.
- Cyan/blue accents.
- Neon status indicators.
- Smooth but restrained transitions.
- Three-panel desktop layout: rooms, messages, online users.
- Mobile-first behavior with horizontal room navigation and no overflow.

Use `lucide-react` icons. Use `framer-motion` only for lightweight transitions:
message reveal, panel entrance, hover/tap feedback, list updates.

Respect `prefers-reduced-motion`.

## Accessibility

- Keep visible focus states.
- Use labels or `aria-label` for icon-only controls.
- Keep text contrast readable on dark backgrounds.
- Do not hide important status only in color.
- Ensure keyboard users can send messages and switch rooms.

## Deployment

GitHub Pages uses:

```ts
base: '/react-chat/'
```

Do not change this unless the repository name changes.

Deployment workflow lives in `.github/workflows/deploy.yml`.

## Git Notes

This project may live inside a parent repository whose `.gitignore` ignores
`repos/`. If files do not appear in `git status`, check whether `react-chat`
needs to be published as its own repository or the parent tracking strategy
needs to change.
