# Site Craft AI - Project Overview

This is the combined, structured view of project progress and system design.

## 1) Project Purpose

`site-craft-ai` is an AI-powered website builder where users:
- describe a website idea in chat,
- receive streamed AI output,
- preview generated HTML live in an iframe,
- and save project/frame/chat state to the database.

---

## 2) System Levels (What happens at each level)

### Level 0 - Product Level

- **Goal:** Build websites from natural language prompts.
- **Core user journey:** Prompt -> AI generation -> live preview -> save and continue editing.
- **Primary modules:** Auth, Workspace, Playground, AI API, Persistence APIs.

### Level 1 - Application Shell Level

- **Routing and global app setup:** `app/layout.tsx`, `app/page.tsx`, `app/workspace/*`, `app/playground/*`
- **Global providers:** Clerk auth, user context, tooltip/toast providers.
- **Styling system:** Tailwind v4 + shadcn theme tokens in `app/globals.css`.

### Level 2 - Feature Level

- **Authentication:** Clerk middleware + sign-in/sign-up pages.
- **Project creation:** Landing/workspace hero creates project/frame/chat seed.
- **Playground generation loop:** Chat input -> stream response -> detect HTML/text -> render/save.
- **Workspace shell:** Sidebar + header + credits display.

### Level 3 - Data and Integration Level

- **Database access:** Drizzle + Neon (`config/db.ts`).
- **Schema:** users, projects, frames, chats (`config/schema.ts`).
- **AI provider integration:** OpenAI streaming endpoint (`app/api/ai-model/route.ts`).
- **Persistence endpoints:** users/projects/chats/frames API routes.

---

## 3) Current Build Status (Progress)

## Completed Milestones

1. **Bootstrap**
   - Next.js app initialized.

2. **Foundation**
   - Authentication integrated (Clerk).
   - Database + schema integrated (Drizzle + Neon).
   - Landing page added.

3. **Builder Workspace**
   - Workspace shell added (sidebar/header pattern).
   - Chat-centered playground route added.

4. **AI Streaming**
   - `/api/ai-model` created for SSE streaming.
   - Prompt strategy supports UI generation or normal text response.
   - Streaming response wired into chat flow.

5. **Persistence**
   - Frame fetch/update API added.
   - Chat update API added.
   - Project/frame/chat creation flow connected.

6. **Live Preview**
   - Iframe-based renderer implemented.
   - Generated HTML injected and previewed in real time.

---

## 4) Core Runtime Flow (What is going on)

1. User enters website request in landing/workspace hero.
2. Frontend creates `projectId` + `frameId` and posts to `/api/projects`.
3. User lands on `/playground/[projectId]?frameId=...`.
4. Playground fetches frame/chat state from `/api/frames`.
5. On send, playground posts prompt-wrapped message to `/api/ai-model`.
6. AI endpoint streams tokens (SSE).
7. Playground accumulates stream and classifies output:
   - if HTML-like, updates preview code,
   - else treats as normal chat response.
8. Generated result is saved to `/api/frames` and messages to `/api/chats`.
9. User sees persisted chat + rendered website preview.

---

## 5) Folder Structure by Responsibility

### A. Platform and Config
- `package.json`, `tsconfig.json`, `next.config.ts`, `drizzle.config.ts`, `proxy.ts`

### B. App Entrypoints and Layout
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/provider.tsx`

### C. Auth Pages
- `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx`

### D. Workspace Experience
- `app/workspace/layout.tsx`
- `app/workspace/page.tsx`
- `app/workspace/_components/AppHeader.tsx`
- `app/workspace/_components/app-sidebar.tsx`

### E. Playground Experience
- `app/playground/[projectId]/page.tsx`
- `app/playground/_components/ChatSection.tsx`
- `app/playground/_components/PlaygroundHeader.tsx`
- `app/playground/_components/WebsiteDesign.tsx`
- `app/playground/_components/SettingSection.tsx` (placeholder)

### F. API Layer
- `app/api/users/route.ts`
- `app/api/projects/route.ts`
- `app/api/chats/route.ts`
- `app/api/frames/route.ts`
- `app/api/ai-model/route.ts`

### G. Shared Data and Helpers
- `config/db.ts`
- `config/schema.ts`
- `context/UserDetailContext.tsx`
- `types/user.ts`
- `hooks/use-mobile.ts`
- `lib/utils.ts`

### H. UI Design System
- `components/ui/*` (shadcn/radix-style reusable primitives)

---

## 6) API Responsibility Map

- **`/api/users`** - Ensure authenticated user exists in DB and return profile.
- **`/api/projects`** - Create new project + first frame + initial chat.
- **`/api/chats`** - Persist updated chat messages for a frame.
- **`/api/frames`**
  - `GET`: Return frame data + chat messages.
  - `PUT`: Save generated design code.
- **`/api/ai-model`** - Stream OpenAI output as SSE to frontend.

---

## 7) Data Model (Current)

- **users**
  - `id`, `name`, `email`, `credits`

- **projects**
  - `id`, `projectId`, `createdBy`, `createdOn`

- **frames**
  - `id`, `frameId`, `designCode`, `projectId`, `createdOn`

- **chats**
  - `id`, `frameId`, `chatMessage` (JSON), `createdBy`, `createdOn`

---

## 8) What is Stable vs In Progress

### Stable / Implemented
- End-to-end prompt -> generation -> preview -> save loop.
- Auth-protected app experience.
- Basic persistence for projects/frames/chats.

### In Progress / Expandable
- Sidebar project listing currently placeholder.
- Settings section in playground is placeholder.
- Additional guardrails/validation can be improved in APIs and parsing flow.

---

## 9) Quick Technical Snapshot

- **Frontend:** Next.js App Router + React 19 + Tailwind + shadcn UI
- **Auth:** Clerk
- **DB:** Neon Postgres + Drizzle ORM
- **AI:** OpenAI chat completions with streaming
- **State Pattern:** Local component state + context for user details
