# Firebase Realtime Database Rules

Deployable rules live in `firebase/database.rules.json`. That file includes
the Realtime Database `.indexOn` entries; RTDB does not use a separate indexes
file.

SmartIoT Chat uses Firebase Auth and Realtime Database only. It does not use
Firebase Storage. Attachments (images/files) are stored locally in IndexedDB;
Firebase only stores metadata references.

Paste the exact contents of `firebase/database.rules.json` in Firebase Console
-> Realtime Database -> Rules, or deploy with Firebase CLI.

The deployable rules enforce:

- Authenticated reads only.
- Message writes only for `auth.uid`.
- Firebase message and presence roles fixed to `guest`; demo-only bot/sensor
  roles stay local mock data, not client-claimed production roles.
- Message text max 500 characters.
- Attachment metadata only, max 5 entries, allowed MIME types only, max 5 MB.
- Client timestamps may not be more than 5 minutes in the future.
- Base rooms cannot be deleted from Firebase.

## Notes

- Enable Anonymous sign-in in Firebase Authentication.
- Realtime Database should be created in the same Firebase project used by the
  Vite environment variables.
- Storage rules are intentionally omitted because this app must not use Firebase
  Storage.
- Message `text` is now optional when `attachments` are present.
- The `attachments` field is an array of metadata-only objects (no binary data).
  Binary files are stored locally via IndexedDB.
- Allowed attachment types: png, jpg, jpeg, webp, gif (images) and pdf, txt,
  csv, json (documents). Max file size: 5 MB.
- Attachments are local to the browser/device. Other users see only metadata
  and a "Only available on original device" notice if the Blob is not present
  in their local IndexedDB.
- Message text is stored and rendered as plain text. The UI does not render HTML.

## Client-Side Data Retention

The app runs a client-side cleanup via `retention.service.ts` to prevent data
growth. It runs on mount and every 6 hours while the app is open.

**Retention periods (configurable in `src/features/chat/services/retention.service.ts`):**

| Data | Retention | Notes |
|------|-----------|-------|
| Messages | 7 days | Deleted from Firebase/localStorage |
| Presence (offline/stale) | 2 hours | Deleted from Firebase |
| Custom rooms (user-created) | 30 days | Skipped if room has messages < 7 days old |
| Attachment blobs | 7 days | Removed from IndexedDB + metadata stripped |

**Throttle mechanism:**

A localStorage key `smartiot-chat:last-cleanup` records the last cleanup timestamp.
Cleanup only runs if at least 6 hours have elapsed since the last run. This prevents
excessive writes on rapid page loads or multiple tabs.

**Base rooms (never deleted by retention):**

- `general`
- `support`
- `iot-alerts`
- `network-ops`
- `device-fleet`

These 5 rooms are hardcoded in `src/features/chat/services/retention.service.ts:22-28`.
Any other room (user-created) is eligible for deletion if it is older than 30 days and
has no messages newer than 7 days.

**Presence cleanup in deployed rules:**

The actual rules in `firebase/database.rules.json` allow cleanup of stale
presence (lastSeenAt > 2 hours ago) by any authenticated user:

```json
".write": "auth != null && ((newData.exists() && auth.uid == $uid) || (!newData.exists() && (auth.uid == $uid || data.child('lastSeenAt').val() < now - 7200000)))"
```

Create/update requires own UID. Delete allows own UID **or** any entry with
`lastSeenAt` older than 2 hours. This is sufficient for the retention service
to clean stale entries from any user.
