# Task 001: Demo Mode Smoke Check

You are working on SmartIoT Chat, a frontend-only Vite + React + TypeScript app.

Goal: verify that demo mode still works when Firebase env vars are missing, and make the smallest safe fix if it does not.

Context:
- Demo mode is required. Fresh clone must run without Firebase setup.
- Firebase env vars live in `VITE_FIREBASE_*`.
- Demo/mock code should stay in `src/mocks`, `src/lib`, or `src/features`.
- No backend, Docker, uploads, attachments, Firebase Storage, Firestore, or `dangerouslySetInnerHTML`.
- Message text must stay plain text and limited to 500 characters.

Scope:
1. Inspect demo mode flow from app startup through auth/chat rendering.
2. Run with no Firebase env vars.
3. Confirm rooms, messages, send-message path, and presence UI do not crash.
4. If broken, patch only the minimal files needed.
5. Do not redesign UI.
6. Do not change deployment base `/react-chat/`.

Suggested files to inspect first:
- `src/lib/env.ts`
- `src/lib/firebase.ts`
- `src/features/auth/useAuth.ts`
- `src/features/auth/AuthProvider.tsx`
- `src/features/chat/services/chat.service.ts`
- `src/features/chat/hooks/useRooms.ts`
- `src/features/chat/hooks/useMessages.ts`
- `src/features/chat/hooks/useSendMessage.ts`
- `src/mocks/mockRooms.ts`
- `src/mocks/mockMessages.ts`

Verification required:
```bash
npm run lint
npm run build
```

Deliverable:
- Short summary of what was checked.
- List of changed files, if any.
- Exact command results for lint/build.
- Any remaining risk or follow-up, only if real.
