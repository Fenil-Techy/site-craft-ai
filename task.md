# Phase 1 + Phase 2 Execution Tracker

## Phase 1 — Critical Bugs

- [x] 1.1 · Fix double Hero render in workspace/layout.tsx
- [x] 1.2 · Fix system prompt `{userInput}` placeholder
- [x] 1.3 · Replace `frameId` random int with UUID
- [x] 1.4 · Delete `SaveMessages` dead code
- [x] 1.5 · Fix `setLoading` never resets on image load error
- [x] 1.6 · Fix border radius not applied in ImageSetting
- [x] 1.7 · Fix metadata title/description in layout.tsx
- [x] 1.8 · Fix `project_list` null user crash + remove @ts-ignore
- [x] 1.9 · Remove unused `encoder` variable in AI route
- [x] 1.10 · Clean up eslint-disable suppressions + type OnSaveContext

## Phase 2 — Security Hardening

- [x] 2.1 · Authenticate `/api/ai-model`
- [x] 2.2 · Authenticate `/api/chats`
- [x] 2.3 · Authenticate `/api/imagekit-upload`
- [x] 2.4 · Add rate limiting (Upstash) on AI + project creation endpoints
- [x] 2.5 · Move `projectId` + `frameId` generation server-side
- [x] 2.6 · Remove `allow-same-origin` from iframe sandbox
- [x] 2.7 · Validate `model` against server-side allowlist in AI route
- [x] 2.8 · Add `designCode` size limit in PUT /api/frames
- [x] 2.9 · Add server-side file type + size validation in imagekit-upload
- [x] 2.10 · Validate message array structure (Zod) in chat + AI endpoints
- [x] 2.11 · Add security headers in next.config.ts
- [x] 2.12 · Audit NEXT_PUBLIC_ env vars exposure — created .env.example template

## Bonus (from Phase 4)
- [x] 4.8 · Prevent double-submit on project creation button
- [x] Accessibility: Added `title` attr to preview iframe
