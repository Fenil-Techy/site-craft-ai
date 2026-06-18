# CraftPortfolio — Pre-Launch Senior Engineer Review

> **Reviewed by:** AI Code Review  
> **Date:** 2026-06-18  
> **Codebase:** `site-craft-ai-1` (Next.js 16 / React 19 / Drizzle + Neon / Clerk / OpenRouter)

---

## 1. Project Architecture

**Type:** Monolithic Next.js App Router application (no separate backend service).

```
Browser
  │
  ├── Landing Page (public)  ←→  Clerk Auth (modal)
  ├── /workspace (protected) ←→  Clerk session
  └── /playground/[id]       ←→  Clerk session
           │
           ├── /api/users          (POST)  – upsert user in DB
           ├── /api/projects       (POST)  – create project + frame + chat
           ├── /api/frames         (GET/PUT) – fetch/update frame
           ├── /api/chats          (PUT)  – update chat messages
           ├── /api/project_list   (GET)  – list all user projects
           ├── /api/ai-model       (POST, SSE stream) – proxy OpenRouter
           └── /api/imagekit-upload (POST) – upload image to ImageKit
                    │
                    ├── Neon Postgres (via Drizzle ORM)
                    └── OpenRouter AI API (streamed completions)
```

**Architectural Pattern:** Component-per-page with shared context state. No Redux, no Zustand, no server-state library (React Query, SWR). All data fetching is done ad-hoc via `axios` inside components/effects.

---

## 2. Folder Structure Explanation

```
e:\site-craft-ai-1\
├── app/
│   ├── (auth)/sign-in & sign-up      ← Clerk catch-all route pages
│   ├── _components/                  ← Landing page components (Header, Hero)
│   ├── api/                          ← All Next.js API route handlers
│   │   ├── ai-model/route.ts         ← OpenRouter SSE proxy
│   │   ├── chats/route.ts            ← Chat persistence
│   │   ├── frames/route.ts           ← Frame fetch/save
│   │   ├── imagekit-upload/route.ts  ← Image upload
│   │   ├── project_list/route.ts     ← Project listing
│   │   ├── projects/route.ts         ← Project creation
│   │   └── users/route.ts            ← User upsert
│   ├── globals.css                   ← Tailwind v4 + shadcn tokens
│   ├── layout.tsx                    ← Root layout (Clerk, fonts, providers)
│   ├── page.tsx                      ← Landing page (/)
│   ├── playground/
│   │   ├── [projectId]/page.tsx      ← Main editor (HUGE: 686 lines)
│   │   └── _components/             ← Chat, Header, WebsiteDesign, Settings
│   ├── pricing/page.tsx              ← Clerk PricingTable (static)
│   ├── provider.tsx                  ← Global state providers
│   ├── sitemap.ts                    ← Static sitemap
│   └── workspace/                   ← Dashboard (sidebar + hero)
├── components/ui/                   ← 56 shadcn/radix UI primitives
├── config/
│   ├── db.ts                         ← Drizzle + Neon connection
│   ├── models.ts                     ← AI model definitions
│   └── schema.ts                     ← DB schema (4 tables)
├── context/
│   ├── OnSaveContext.tsx             ← Save trigger context
│   └── UserDetailContext.tsx         ← User session state
├── hooks/use-mobile.ts              ← Breakpoint hook
├── lib/utils.ts                     ← cn() utility
├── proxy.ts                         ← Clerk middleware (misnamed)
├── types/user.ts                    ← AppUser global type
└── public/                          ← Static assets (logos, model icons)
```

**Notable Issues:**
- `proxy.ts` should be named `middleware.ts` — Next.js middleware convention. It currently works because Next.js finds it, but it is confusing and non-standard.
- The `workspace/page.tsx` renders `<Hero />` directly but the layout *also* renders `<Hero />` — resulting in **Hero rendered twice** on `/workspace`.
- The `types/user.ts` declares a global `AppUser` type with no `export`, relying on TypeScript ambient declaration, which is fragile and non-idiomatic.
- Only one custom hook exists (`use-mobile.ts`) — no data-fetching hooks, no API abstraction layer.

---

## 3. Data Flow

```
User types prompt in <Hero />
  │
  ├── [Unauthenticated] → Clerk sign-in modal
  └── [Authenticated]
        │
        ├─ 1. POST /api/projects  (creates projectId, frameId, chat seed)
        │      ↓ credits deducted atomically in DB
        │
        ├─ 2. router.push → /playground/[projectId]?frameId=...
        │
        ├─ 3. useEffect: GET /api/frames?frameId=&projectId=
        │      ↓ returns frame.designCode + chatMessages + selectedModel
        │
        ├─ 4. If chatMessages.length === 1 && no designCode → auto-fire SendMessage()
        │
        ├─ 5. POST /api/ai-model (SSE stream)
        │      ↓ OpenRouter proxied response
        │
        ├─ 6. Client streams response, detects [[MODE:CODE]] or [[MODE:CHAT]]
        │      ↓ Code mode: updates iframe innerHTML in real time
        │
        ├─ 7. PUT /api/chats    (saves updated message history)
        │      PUT /api/frames   (saves final HTML)
        │
        └─ 8. User sees live preview + can continue editing via chat
```

**State Management Issues:**
- `messages` state in the playground page is initialized as `undefined` and immediately spread with `?? []` everywhere — a consistent source of subtle bugs.
- There are two separate credit checks: one client-side in `Hero.tsx` (optimistic, not authoritative) and one server-side in `/api/projects`. The client-side check uses a stale context value.
- The `OnSaveContext` uses `any` type and passes `Date.now()` as a "signal" value rather than a proper event — a hacky pattern that's hard to debug.
- Project list is cached to `localStorage` without any TTL or cache invalidation — users will see stale project lists after changes.

---

## 4. Authentication Flow

```
1. Clerk ClerkProvider wraps entire app (layout.tsx)
2. Middleware (proxy.ts / clerkMiddleware):
   - Public: /, /sign-in(.*), /sign-up(.*), /sitemap.xml, /robots.txt
   - Protected: everything else (calls auth.protect())
3. Sign-in/up pages: Clerk catch-all routes via [[...sign-in]] / [[...sign-up]]
4. After auth: Provider useEffect calls POST /api/users to upsert user in DB
5. API routes use currentUser() from @clerk/nextjs/server for server-side verification
6. Credits and plan check via auth().has({ plan: 'pro' }) from Clerk
```

**Auth Vulnerabilities:**
- `/api/chats` PUT endpoint has **zero authentication** — anyone can update anyone's chat messages if they know the frameId.
- `/api/imagekit-upload` has **zero authentication** — publicly accessible image upload endpoint.
- The `project_list` GET endpoint calls `currentUser()` but does **not check** if `user` is null before using `user?.primaryEmailAddress?.emailAddress` — a `@ts-ignore` suppresses the TypeScript error rather than handling it.
- The `pricing` page is **not protected** by middleware, which is fine, but it also has no auth guard — unintentional or intentional?

---

## 5. Database Schema and Relationships

```sql
users
  id (PK, auto-increment integer)
  name (varchar 255, NOT NULL)
  email (varchar 255, NOT NULL, UNIQUE)
  credits (integer, NOT NULL, DEFAULT 2)

projects
  id (PK, auto-increment integer)
  projectId (varchar, NOT NULL, UNIQUE)        ← UUID from client
  createdBy (varchar, FK → users.email)        ← email as FK ⚠️
  selectedModel (varchar, nullable)
  createdOn (timestamp, DEFAULT NOW)

frames
  id (PK, auto-increment integer)
  frameId (varchar, NOT NULL, UNIQUE)          ← random 0–9999 int ⚠️
  designCode (text, nullable)
  projectId (varchar, FK → frames.projectId)
  createdOn (timestamp, DEFAULT NOW)

chats
  id (PK, auto-increment integer)
  frameId (varchar, FK → frames.frameId)
  chatMessage (json, nullable)                 ← entire message array in one cell ⚠️
  createdBy (varchar, FK → users.email)
  createdOn (timestamp, DEFAULT NOW)
```

**Critical Schema Problems:**

| Issue | Severity |
|---|---|
| `frameId` is generated as `Math.floor(Math.random() * 10000)` — only 10,000 possible values, collision-prone | **CRITICAL** |
| `createdBy` FK references `users.email` instead of `users.id` — email changes break referential integrity | **HIGH** |
| `chatMessage` stores an entire JSON array in a single column (no normalization) — limits querying, grows unbounded | **HIGH** |
| No index on `projectTable.createdBy` — full table scan on every project list query | **MEDIUM** |
| No index on `frameTable.projectId` | **MEDIUM** |
| No index on `chatTable.frameId` | **MEDIUM** |
| `designCode` is `text` with no size limit — a 500KB generated site stores in one DB row | **MEDIUM** |
| No `updatedOn` timestamp on any table | **LOW** |
| No soft delete / archived status on projects | **LOW** |

---

## 6. API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/users` | Clerk | Upsert user in DB |
| POST | `/api/projects` | Clerk | Create project + frame + chat; deduct credit |
| GET | `/api/frames` | Clerk | Fetch frame + chat + model |
| PUT | `/api/frames` | Clerk | Save generated design code |
| PUT | `/api/chats` | **NONE** | Update chat messages |
| GET | `/api/project_list` | Clerk | List user's projects with chats |
| POST | `/api/ai-model` | **NONE** | Proxy OpenRouter SSE stream |
| POST | `/api/imagekit-upload` | **NONE** | Upload image to ImageKit |

**API Design Problems:**
- `/api/ai-model` is completely unauthenticated. Anyone can send arbitrary requests to OpenRouter using your API key, costing you money.
- `/api/chats` is unauthenticated — frameId is a number 0-9999, trivially enumerable by a script.
- `/api/imagekit-upload` is unauthenticated — anyone can upload arbitrary files to your ImageKit account.
- Naming inconsistency: `project_list` uses underscores while all other routes use hyphens (`ai-model`, `imagekit-upload`).
- No rate limiting on any endpoint.
- No input size limits (max_tokens is 12,000 tokens — a user could send 12,000 tokens worth of content per request with no rate limiting).
- `PUT /api/frames` returns `{ result: "Updated" }` regardless of whether any row was actually updated (no rowCount check).
- `PUT /api/chats` similarly returns `{ result: "updated" }` with no validation.

---

## 7. AI Generation Pipeline

```
1. User prompt submitted
2. System prompt injected (hardcoded ~330 lines in page.tsx)
   - Includes full portfolio design specs, typography rules, color guidance
   - Replaces {userInput} placeholder (but actually sends empty string for placeholder)
3. If generatedCode exists → injected as assistant turn (continuation context)
4. Full message history appended
5. User message appended
6. POST /api/ai-model → OpenRouter (no auth check)
7. SSE stream proxied back
8. Client reads stream, detects [[MODE:CODE]] or [[MODE:CHAT]] marker
9. Code mode: updates iframe innerHTML every 500 chars
10. Chat mode: displays text in chat bubble
11. Fallback: heuristic HTML tag detection if mode marker is missing
12. After stream: PUT /api/chats + PUT /api/frames
```

**Pipeline Problems:**
- The system prompt's `{userInput}` placeholder is **never filled** — `prompt.replace("{userInput}", "")` replaces the placeholder with an empty string. The user's input only appears as the final user message, not in the system prompt context.
- The `encoder` variable is declared in the API route but **never used**.
- Full chat history (`messages`) is sent with every request — no summarization, no truncation. As chats grow, token costs grow linearly and eventually hit the 12,000 token limit, silently cutting off context.
- Mode detection relies on a custom `[[MODE:CODE]]` marker that models may not reliably produce. The regex fallback heuristic (`<main|section|div|header|...>`) could falsely classify chat responses containing HTML examples as code.
- No retry logic for failed or partial AI responses.
- No timeout on the SSE stream — a stalled response will hang the client indefinitely.
- `setGeneratedCode` fires every 500 chars during streaming, causing frequent iframe re-renders during generation.
- The generated HTML is injected via `innerHTML` directly into an iframe `#root` element — no sanitization (though the `sandbox="allow-scripts allow-same-origin"` attribute provides partial mitigation).

---

## 8. Security Vulnerabilities

### Critical

1. **Unauthenticated AI proxy** (`/api/ai-model`): Any external actor can make unlimited requests to OpenRouter using your API key. Cost could run up to thousands of dollars.

2. **Unauthenticated chat update** (`/api/chats`): Anyone with a frameId (0–9999 integer) can overwrite any user's chat history. With 10,000 possible IDs, a script can enumerate all of them in minutes.

3. **Unauthenticated image upload** (`/api/imagekit-upload`): Free file upload to your ImageKit account for anyone. Could be used for phishing content hosting.

4. **frameId collision vulnerability**: `Math.floor(Math.random() * 10000)` generates 0–9999. With enough users (Birthday Paradox: ~130 users creates 50% collision chance), frames silently overwrite each other's data.

### High

5. **XSS via AI-generated HTML in iframe**: The iframe uses `sandbox="allow-scripts allow-same-origin"` which explicitly allows scripts. AI-generated content with malicious `<script>` tags runs inside the iframe. Same-origin means it can access parent window context.

6. **Client-side credit check bypassed**: The `userDetail?.credits <= 0` check in `Hero.tsx` can be bypassed by a user manipulating the JS context. Only the server-side check in `/api/projects` is authoritative, but the client gives a false sense of security.

7. **`@ts-ignore` masking null reference** in `project_list/route.ts`: If `currentUser()` returns null (unauthenticated request slips through), the code still runs and queries the DB with `undefined` as the email, potentially returning all records.

### Medium

8. **No CSRF protection** on state-mutating routes: POST/PUT routes rely on Clerk session cookies. While Clerk may provide some CSRF protection, no explicit CSRF token or SameSite cookie validation is implemented.

9. **`allow-same-origin` sandbox flag**: Combined with `allow-scripts`, this is equivalent to no sandbox for same-origin scripts. Should be removed for true isolation.

10. **Sensitive data in localStorage**: Project list data (including chat content) is stored unencrypted in localStorage, accessible to any same-origin JavaScript.

---

## 9. Performance Bottlenecks

1. **N+1 query pattern in `project_list`**: For each project, it makes a separate DB query for frames. For 10 projects with 3 frames each, that's 11+ sequential DB queries per page load.

2. **No database indexes**: Every query on `createdBy`, `frameId`, `projectId` does a full table scan as the dataset grows.

3. **iframe re-injected entirely on every code change**: `root.innerHTML = generatedCode` replaces the entire preview on every state update, including style changes from the settings panel, causing full repaint.

4. **Full message array sent on every AI request**: No pagination or summarization. A 30-message chat sends all 30 messages to OpenRouter every time.

5. **`localStorage` cache with no invalidation**: Project list is cached but never cleared when new projects are created. Users see stale data until they manually refresh.

6. **Font weight variant explosion**: Poppins loaded with weights 400, 500, 600, 700 as a CSS import for every page load.

7. **No image optimization for CDN-hosted Unsplash images**: The AI-generated HTML uses raw Unsplash URLs without size parameters. A 4K hero image is loaded at full resolution.

8. **`reactStrictMode: false`** in next.config.ts: Disables React's double-invocation development check, masking effect cleanup issues. This is a development-safety regression.

9. **Large `SyntaxHighlighter` bundle**: `react-syntax-highlighter` with no dynamic import. Adds ~70KB to the bundle for all users, even those who never open the code viewer.

10. **No `React.memo` or `useCallback` optimization** in the heavily-rerendering `ElementSettingSection` — every style change triggers a re-render of the entire settings panel.

---

## 10. Code Smells and Duplication

1. **`HTML_CODE` template string duplicated verbatim** in both `WebsiteDesign.tsx` and `PlaygroundHeader.tsx` — they differ by having extra CDN scripts in `PlaygroundHeader`. This is a maintenance hazard: a library update must be done in two places.

2. **686-line `page.tsx`** in `/playground/[projectId]` — the system prompt (330 lines), `SendMessage` logic, `SaveGeneratedCode`, `SaveMessages`, and all rendering are in one component. Violates Single Responsibility Principle.

3. **`SaveMessages` function defined but never called**: In `playground/[projectId]/page.tsx`, `SaveMessages` at line 579 is declared but unused — dead code.

4. **Commented-out code blocks**: Multiple large commented-out sections exist in `page.tsx` (lines 422–428 — chat history; lines 317–326 — toolbar) that should either be removed or addressed.

5. **`any` type abuse**: Multiple files use `// eslint-disable-next-line @typescript-eslint/no-explicit-any` followed by `any` types — `app-sidebar.tsx`, `project_list/route.ts`, `provider.tsx`, `PlaygroundHeader.tsx`, `ChatSection.tsx`.

6. **`OnSaveContext` typed as `any`**: The context's value and setter are typed `any`, losing all type safety for the save mechanism.

7. **`setLoading(true)` in `GenerateAiImage` but never set to `false`**: In `ImageSetting.tsx` line 119, `setLoading(true)` is set but only reset in `onLoad` of the image — if the image fails to load, the spinner runs forever.

8. **`@ts-ignore` comments**: Two `@ts-ignore` in `project_list/route.ts` suppress legitimate type errors instead of fixing them.

9. **`/* eslint-disable */` blanket comment** at top of files as a workaround instead of fixing the underlying issue.

10. **Inline magic strings for model IDs**: The default model `"google/gemma-4-26b-a4b-it"` is hardcoded in both `Hero.tsx` and `page.tsx` separately, not derived from `AI_MODELS[0].id`.

11. **`generateRandomFrameNumber` function is misnamed and misplaced**: Returns a random integer 0–9999 (not a UUID), and is defined at the bottom of `Hero.tsx` outside the component — should be in a utilities file.

---

## 11. Scalability Issues

1. **frameId space exhaustion**: With only 10,000 possible frame IDs, the system will start producing collisions rapidly under moderate traffic. At 100 concurrent users each creating a frame, collision probability exceeds 40%.

2. **Single JSON blob for all chat messages**: Storing `chatMessage` as a single JSON blob means every chat update rewrites the entire conversation. As chats grow to hundreds of messages, each `PUT /api/chats` rewrites kilobytes of data for a single new message.

3. **No pagination on project list**: `/api/project_list` returns ALL projects for a user with their nested frames and chats. For power users with 50+ projects, this becomes a very large payload.

4. **No caching layer**: Every request hits Neon Postgres directly. No Redis/Upstash layer, no Next.js unstable_cache.

5. **Single Neon connection per request**: `config/db.ts` creates a new `drizzle(neon-http)` connection-level instance per import. HTTP-based Neon serverless is appropriate for serverless, but lacks connection pooling.

6. **Stateless SSE**: The AI proxy streams directly. If a serverless function times out (default Vercel timeout: 10 seconds for hobby, 60 seconds for Pro), the stream dies mid-generation. No resume capability.

7. **No job queue**: Long AI generations are synchronous HTTP requests. Under load, many concurrent generations will exhaust serverless concurrency limits.

8. **`selectedModel` stored per project but not validated**: There's no server-side validation that the `model` param is one of the allowed models. A user could inject any OpenRouter-supported model ID (including expensive ones).

---

## 12. UI/UX Inconsistencies

1. **Hero component renders twice on `/workspace`**: `workspace/layout.tsx` renders `<Hero />` AND `workspace/page.tsx` also renders `<Hero />`. This causes double rendering of the entire landing prompt section.

2. **App name inconsistency**: The package.json says `site-craft-ai`, the sitemap references `craftportfolio.online`, and the UI says "CraftPortfolio" — three different identities.

3. **`metadata` in layout.tsx still has default text**: `title: "Create Next App"` and `description: "Generated by create next app"` — no real SEO metadata for the product.

4. **No empty state for playground when no code generated yet**: After creating a new project, the iframe shows a blank page with no "Generating..." indicator while the AI streams the first response (there's a loader but it hides after frame data loads, before generation completes).

5. **Chat area doesn't auto-scroll to latest message**: New messages are appended but the scroll position isn't maintained at the bottom.

6. **Chat input doesn't support Enter to send**: The `ChatSection.tsx` textarea captures Enter for newlines (standard `textarea` behavior) but there's no keyboard shortcut to send (Ctrl+Enter / Cmd+Enter).

7. **`Save` button uses `animate-spin` on the icon** which makes a Save icon look like a loading spinner — the wrong icon should be used (a spinner icon, not a rotating save icon).

8. **Progress bar for credits hardcodes max credits as 2**: `(userDetail?.credits / 2) * 100` assumes maximum credits is always 2. Upgrading this limit requires a code change.

9. **Mobile chat overlay lacks animation**: The mobile chat widget appears/disappears abruptly with no transition animation.

10. **The settings panel's border radius field in `ImageSetting.tsx` doesn't apply the value to the DOM element** — `setBorderRadius` updates local state but is never synced back to `selectedElement.style.borderRadius`.

11. **`ViewCodeBlock` has no syntax language specified** in `SyntaxHighlighter` — defaults to plain text, losing HTML syntax highlighting.

12. **Collapsed sidebar shows non-functional icon buttons** (SquarePen and MessageCircle) with no click handlers attached to them.

---

## 13. Missing Edge Cases

1. **What if the AI generates code with no `[[MODE:CODE]]` or `[[MODE:CHAT]]` marker AND no HTML tags?** The mode falls to `"chat"` but the full raw response including any partial HTML is displayed as a chat bubble.

2. **What if the user navigates away mid-stream?** The SSE reader keeps running in the background. No cleanup/abort controller on unmount.

3. **What if `GET /api/frames` returns an empty frame (first load, no designCode)?** The code handles this, but if `result.data?.chatMessages` is also undefined, `messages` is initialized to `[]` — and then `SendMessage` fires before the user has seen the chat, potentially confusing them.

4. **Concurrent tab editing**: If a user opens the same project in two tabs and edits in both, the second save overwrites the first with no conflict detection.

5. **Very long AI responses exceeding max_tokens**: The response is cut off mid-HTML. The partial HTML is saved and displayed, potentially breaking the rendered page.

6. **User changes model mid-conversation**: The `selectedModel` is read from the URL/frame data, but if the user could change it in a future settings UI, the conversation context with prior responses from a different model would break continuity.

7. **`frameId` is a number but typed as `string | null` in URL params**: `params.get('frameId')` returns a string. The API query sends it as a string. The DB column is `varchar`. Consistent but fragile — no numeric validation prevents injecting arbitrary strings.

8. **ImageKit AI image generation (`GenerateAiImage`) doesn't set `setLoading(false)` on error**: If the URL generation fails or the image URL is invalid, `loading` stays `true` forever.

9. **The `downloadButton` creates a Blob URL but never revokes it on error**: If `a.click()` throws, `URL.revokeObjectURL(url)` is never called, causing a memory leak.

10. **What happens when `currentUser()` is called during Clerk's loading state?** The server-side call should always be resolved, but client-side timing issues in `Provider.tsx` could cause multiple rapid API calls if `user` flickers.

---

## 14. Missing Validations

| Location | Missing Validation |
|---|---|
| `Hero.tsx` CreateNewProject | No min/max length check on `userInput` (could send empty string or 10,000 chars) |
| `/api/projects` | `projectId` and `frameId` are accepted from client — not generated server-side (UUID can be spoofed) |
| `/api/projects` | `model` is not validated against allowed model list |
| `/api/projects` | `messages[0].content` length not validated |
| `/api/frames` PUT | `designCode` size not validated — could store megabytes of HTML |
| `/api/chats` PUT | `messages` array not validated — no schema check on message shape |
| `/api/ai-model` | `model` is not validated against an allowlist |
| `/api/ai-model` | `messages` array length not validated — unlimited tokens |
| `ImageSetting.tsx` | File size not validated before upload (could upload a 100MB image) |
| `ImageSetting.tsx` | File type validation relies only on `accept="image/*"` browser hint (bypassable) |
| `ElementSettingSection.tsx` | CSS input values are applied directly without sanitization (e.g., `expression(...)` in older browsers) |

---

## 15. Missing Loading/Error States

| Feature | Missing State |
|---|---|
| Initial page/workspace load | No global loading skeleton — content pops in |
| `Provider.tsx` user fetch | No loading state — `userDetail` is `null` during fetch, causing flicker |
| Project creation in `Hero.tsx` | `setLoading(false)` is called BEFORE `router.push()` resolves — no loading during navigation |
| After stream completes, saving messages/frames | No feedback that saving is in progress |
| `/api/frames` GET failure | Error is silently caught by `void axios.get()` — user sees blank playground |
| `project_list` fetch error | Caught in `catch` block but only logged to console — sidebar shows nothing |
| `ImageSetting` upload error | Shows `console.error` but no toast or UI error message |
| `GenerateAiImage` error (bad URL) | No error state — spinner may run forever |
| Model selection (no models available) | No fallback if `AI_MODELS` is empty |
| Network offline | No offline detection or graceful degradation message |
| OpenRouter API down | Returns a generic "Error" string (status 500) with no user-friendly message |

---

## 16. Missing Accessibility Features

1. **No `<main>` landmark on landing page**: The root `page.tsx` uses `<main>` only in workspace but not on the landing hero.
2. **No skip-to-content link** for keyboard users.
3. **Suggestion buttons in Hero** use `key={index}` instead of unique keys and lack `aria-label` descriptions (icon + label text only).
4. **Chat messages don't use `<ul>/<li>` semantics** — they're `<div>` elements with no ARIA roles. Screen readers won't announce them as a list.
5. **The mobile floating chat button** only has a `<Sparkles>` icon with no `aria-label`.
6. **Color picker inputs** (`<input type="color">`) have no label association via `htmlFor`/`id` pairs in `ElementSettingSection`.
7. **The iframe lacks a descriptive `title` attribute** — screen readers can't describe its contents.
8. **No keyboard trap prevention** for the mobile chat overlay — keyboard users can't easily close it.
9. **Focus management**: When the element settings panel opens, focus doesn't move to the panel.
10. **`SyntaxHighlighter` code block** lacks `aria-label="Source code"` or a region landmark.
11. **No `role="status"` or `aria-live`** region for the "Thinking..." streaming indicator — screen readers won't announce AI response updates.
12. **Contrast ratio** of `text-gray-400` on `bg-black` in the chat "No Messages Yet!" placeholder may fail WCAG AA.

---

## 17. Areas Where Users Can Break the App

1. **Submit with empty input after bypassing client guard**: The `disabled={!userInput}` button is bypassed if `userInput` is a string of spaces — the guard `!userInput` is truthy for `" "` but it gets past the check because the value is truthy. The server receives an empty prompt.

2. **Submit the same prompt twice rapidly**: Double-clicking the generate button fires two concurrent `POST /api/projects` requests, creating two separate projects and deducting two credits.

3. **Open project in two browser tabs and save in both**: Last save wins, silently discarding one edit.

4. **Type into an element in the iframe while streaming**: `contenteditable="true"` is set when clicking, and streaming rewrites `root.innerHTML`, destroying the selection mid-edit.

5. **Select an element, then click outside to deselect**: `clearSelection` removes the `contenteditable` attribute but relies on the `clearSelectionRef.current()` callback — if the ref is stale (component re-mounted), the cleanup fails.

6. **Resize the browser window mid-generation**: The screen size state doesn't affect the iframe during streaming but layout calculations may mismatch.

7. **Use browser back button from playground**: Returns to workspace with stale project list (localStorage cache), and then the `UserDetailContext.credits` value isn't refreshed, showing an incorrect credit count.

8. **Share a playground URL**: Anyone with the URL can view the project (Clerk middleware redirects to sign-in), but `GET /api/frames` checks ownership — however, the frameId is a 0–9999 integer, so anyone can enumerate all frames.

9. **Trigger `GenerateAiImage` rapidly**: Each click makes a URL and tries to load it — no debounce, no cancellation of previous requests.

10. **Upload a non-image file via the image upload endpoint**: The `accept="image/*"` attribute is client-side only and bypassable. The API accepts any file as a base64 string.

---

## 18. Production Readiness Score

| Dimension | Score | Notes |
|---|---|---|
| Auth & Session | 6/10 | Clerk correctly used; 3 unauthenticated endpoints |
| API Security | 3/10 | 3 critical unauthenticated endpoints; no rate limiting |
| Data Integrity | 4/10 | frameId collision issue; email FK; unvalidated inputs |
| Error Handling | 4/10 | Inconsistent; many silent failures |
| Performance | 5/10 | N+1 queries; no indexes; no caching |
| Scalability | 4/10 | frameId exhaustion; no pagination; no job queue |
| Code Quality | 6/10 | Functional but disorganized; dead code; any abuse |
| UX Polish | 6/10 | Good visual design; multiple flow gaps |
| Accessibility | 3/10 | Major gaps throughout |
| Testing | 0/10 | Zero tests of any kind |
| SEO | 3/10 | Default metadata; only 1 sitemap URL |
| Type Safety | 4/10 | Multiple `any`, `@ts-ignore`, global ambient type |

### **Overall Production Readiness Score: 38 / 100**

> This is a functional, visually impressive proof of concept but has critical security vulnerabilities that make it unsafe to launch publicly. The unauthenticated AI proxy alone could result in significant unexpected costs within hours of launch.

---

## 19. Top 30 Improvements Ranked by Impact

| # | Improvement | Impact | Effort |
|---|---|---|---|
| 1 | **Add authentication to `/api/ai-model`** — verify Clerk session before proxying to OpenRouter | 🔴 Critical | Low |
| 2 | **Add authentication to `/api/chats`** — verify Clerk session + ownership before updating chat | 🔴 Critical | Low |
| 3 | **Add authentication to `/api/imagekit-upload`** — verify Clerk session before accepting uploads | 🔴 Critical | Low |
| 4 | **Replace `frameId` with a UUID** — use `uuidv4()` (already a dependency) instead of random 0–9999 integer | 🔴 Critical | Low |
| 5 | **Validate `model` param against `AI_MODELS` allowlist** in `/api/ai-model` and `/api/projects` | 🔴 Critical | Low |
| 6 | **Add rate limiting** (Upstash Redis + `@upstash/ratelimit`) on at minimum `/api/ai-model` and `/api/projects` | 🔴 Critical | Medium |
| 7 | **Fix the system prompt `{userInput}` replacement bug** — currently replaces with empty string | 🟠 High | Low |
| 8 | **Fix the `Hero rendered twice` bug** in workspace layout — remove duplicate `<Hero />` from either `layout.tsx` or `page.tsx` | 🟠 High | Low |
| 9 | **Add `AbortController` to SSE fetch** — cancel the stream on component unmount | 🟠 High | Low |
| 10 | **Fix `setLoading(false)` never called in `GenerateAiImage`** — add it to an error handler | 🟠 High | Low |
| 11 | **Fix `SaveMessages` dead code** — either use it or delete it | 🟠 High | Low |
| 12 | **Deduplicate `HTML_CODE` constant** — extract to a shared `lib/iframe-template.ts` | 🟠 High | Low |
| 13 | **Add DB indexes** on `createdBy`, `frameId`, `projectId` columns | 🟠 High | Low |
| 14 | **Fix N+1 query in `project_list`** — use a JOIN or a single query with `inArray` | 🟠 High | Medium |
| 15 | **Update `metadata` in `layout.tsx`** — add real title, description, og:image | 🟠 High | Low |
| 16 | **Change `createdBy` FK from email to user's integer `id`** — email is mutable | 🟠 High | Medium |
| 17 | **Add `generateProjectId` server-side** — don't accept UUIDs from the client | 🟡 Medium | Low |
| 18 | **Add `max-length` validation on `designCode`** in PUT `/api/frames` | 🟡 Medium | Low |
| 19 | **Auto-scroll chat to bottom** on new messages (use `useRef` on message container) | 🟡 Medium | Low |
| 20 | **Add Ctrl+Enter / Cmd+Enter to send message** in `ChatSection.tsx` | 🟡 Medium | Low |
| 21 | **Add `aria-live="polite"` region** for streaming response indicator | 🟡 Medium | Low |
| 22 | **Add `title` attribute to the iframe** for screen reader accessibility | 🟡 Medium | Low |
| 23 | **Add `localStorage` TTL and cache invalidation** for project list | 🟡 Medium | Low |
| 24 | **Dynamic import `react-syntax-highlighter`** to reduce initial bundle size | 🟡 Medium | Low |
| 25 | **Fix the border radius field in `ImageSetting.tsx`** — sync state to `selectedElement.style.borderRadius` | 🟡 Medium | Low |
| 26 | **Add `reactStrictMode: true`** in `next.config.ts` | 🟡 Medium | Low |
| 27 | **Add pagination to `project_list`** — return max 20 projects per page | 🟡 Medium | Medium |
| 28 | **Extract the 686-line `playground/page.tsx`** into sub-components: `useAIStream` hook, `useSaveFrame` hook | 🟡 Medium | High |
| 29 | **Add at least smoke tests** for the credit deduction and project creation API routes | 🟡 Medium | High |
| 30 | **Add `sandbox="allow-scripts"` without `allow-same-origin`** to the preview iframe to properly isolate AI-generated content | 🟡 Medium | Low |

---

*End of Report*
