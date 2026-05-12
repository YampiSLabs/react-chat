# Firebase Configuration

Use these files for the SmartIoT Chat Firebase project.

## Realtime Database

Rules and indexes live together in `database.rules.json`. Realtime Database does
not use a separate indexes file; `.indexOn` entries are part of the rules file.

Apply from this directory:

```bash
firebase deploy --only database
```

Or apply from the repository root:

```bash
firebase deploy --only database --config firebase/firebase.json
```

## Included Indexes

- `rooms`: `createdAt`, `name`
- `messages/{roomId}`: `createdAt`, `userId`
- `presence`: `lastSeenAt`, `online`

## Notes

- Firebase Storage is intentionally not configured.
- Attachments store only metadata in Realtime Database. File blobs stay in
  browser IndexedDB.
- Message cleanup can delete messages older than 7 days. Users can delete their
  own recent messages.
- Presence cleanup can delete entries older than 2 hours. Writes/updates still
  require `auth.uid == $uid`.
