# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run start` — run the built app
- `npm run lint` — `next lint`

No test runner is configured. There is no separate typecheck script; rely on `next build` or `npx tsc --noEmit`.

## Architecture

This is a **Next.js 14 App Router** project (TypeScript, Tailwind). **Auth is Clerk**; **hotel rate data is still client-side localStorage** (no DB). Every page is a Client Component (`'use client'`).

### Auth (Clerk)

- [middleware.ts](middleware.ts) — `clerkMiddleware` protects `/dashboard(.*)`. Everything else is public.
- [app/layout.tsx](app/layout.tsx) wraps the tree in `<ClerkProvider>` with a custom `appearance` mapping to the Via Kashmir palette.
- [app/login/[[...sign-in]]/page.tsx](app/login/[[...sign-in]]/page.tsx) hosts Clerk's `<SignIn>` inside the branded card shell. Routing is `path`-based so Clerk owns sub-routes under `/login`.
- **Clerk user → hotel mapping** is by `user.publicMetadata.hotelId` (string, case-insensitive — matched against keys in `SEED_HOTELS` / `loadHotels()`). Set this in the Clerk dashboard per user. If unset or unknown, the dashboard renders a "Hotel not linked" notice instead of crashing.
- Env vars live in `.env.local` (see `.env.local.example`): `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, plus the sign-in URL overrides pointing to `/login` and `/dashboard`.

### Data flow

- [lib/data.ts](lib/data.ts) — domain model (`Hotel`, `Room`, `MealPlan`, etc.), the `SEED_HOTELS` map, and two storage keys: `STORE_KEY` (hotels), `LS_SYNC_KEY` (cross-tab sync ping). The `Hotel.password` field is **legacy and unused** post-Clerk migration; new hotel records don't need to set it.
- [lib/storage.ts](lib/storage.ts) — wraps localStorage. `loadHotels()` merges any new entries from `SEED_HOTELS` into the persisted map on every load, so adding a hotel to the seed propagates to existing users without wiping their edits. `saveHotels()` writes to `STORE_KEY` and bumps `LS_SYNC_KEY` to trigger the cross-tab `storage` event.
- Pages listen for `window.addEventListener('storage', …)` and reload hotels when `LS_SYNC_KEY` changes — this is how the public board reflects dashboard edits live across tabs.

### Pages

- [app/page.tsx](app/page.tsx) — public live rates board (read-only grid of `HotelCard`s). Uses Clerk's `useAuth()` only to toggle the Dashboard/Logout chips in the header.
- [app/dashboard/page.tsx](app/dashboard/page.tsx) — single-hotel edit view. Resolves the editable hotel from `useUser().publicMetadata.hotelId`. Edits are local until **Save** is clicked per row, which calls `persist()` to write the entire hotels map back.

### Design system

The visual layer is the **Via Kashmir "Alpine Editorial" theme** — the canonical reference is the HTML in `/Users/aribanigar/Downloads/via-kashmir-theme-factory.html` (not in this repo). The rules that matter when editing styles:

- Fonts: **Manrope** (display/headlines) + **Inter** (body). Loaded via Google Fonts `@import` in [app/globals.css](app/globals.css), not `next/font` — keep it that way so the markup mirrors the theme factory HTML.
- Icons: **Flaticon UIcons** via CDN (`fi fi-rr-*` regular, `fi fi-rs-*` solid). Do not use emojis. `lucide-react` is in `package.json` but new code should prefer Flaticon classes.
- Color tokens are CSS variables (`--vk-primary`, surface hierarchy, etc.) defined in `globals.css` and mirrored in [tailwind.config.ts](tailwind.config.ts).
- Component primitives are CSS classes, not React components: `.btn-primary` (gradient CTA), `.btn-secondary`, `.btn-tertiary` (saffron — urgency only), `.card-elevated`, `.input-field`, `.badge-*`, `.glass-nav`.
- **No 1px sectioning borders** — separate regions with surface-color shifts (`surface-container-low/-/-high/-highest`).
- Responsive layout is driven by classes in `globals.css` (`.app-shell`, `.hero-section`, `.stat-grid`, `.form-grid`, `.filter-row`, `.hotel-grid`, `.table-scroll`, `.login-shell`) with breakpoints at 900px / 600px / 380px. CSS media queries can override class-driven styles but **not** inline `style={}` props — when adding new responsive behavior, route it through a class.

### Path alias

`@/*` maps to the repo root (see [tsconfig.json](tsconfig.json)) — e.g. `@/components/Header`, `@/lib/storage`.

### Deployment

Target repo is `https://github.com/viakashmir/b2bviakashmir` (deployed via Vercel under the `viakashmir` account, Hobby plan). Hobby does not allow external collaborators, so commits must be authored as `viakashmir <243838831+viakashmir@users.noreply.github.com>` or Vercel will block the build with "Deployment Blocked — commit author did not have contributing access". When making commits here, set `GIT_AUTHOR_NAME`/`GIT_AUTHOR_EMAIL` accordingly (or amend before pushing).
