# QA Procedures

## Manual QA Workflow

### 1. Form Testing
- Verify all inputs have labels and required attribute validation.
- Test form submission with invalid data to ensure error states are displayed.

### 2. UX Review
- Ensure consistency in button styles and spacing.
- Validate loading states for all asynchronous actions.

### 3. Functional Smoke Test
- Navigate all main features (`AuthProvider`, `ChatPage`).
- Confirm Pinned Notices and Online Users components render correctly.

## Audit Gates
- Run `npm run lint` and `npm run test` before committing.
