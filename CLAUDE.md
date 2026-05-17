# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run start` — run the built app
- `npm run lint` — `next lint`

No test runner. No separate typecheck script — use `next build` or `npx tsc --noEmit`.

## Architecture

**Next.js 14 App Router · TypeScript · Tailwind**. Auth is **Clerk** with three roles: `admin`, `vendor`, `customer`. Domain data (hotels + concerns) lives in browser `localStorage` (no DB).

### Three-role flow

`middleware.ts` only gates whether `/dashboard`, `/admin`, `/vendor`, `/customer` require a signed-in user — **it does NOT redirect**. The redirect logic lives in [app/dashboard/page.tsx](app/dashboard/page.tsx), a server component that uses `currentUser()` (fresh metadata from the Clerk backend, not the cached JWT) to:

1. **Auto-assign `role = 'vendor'`** to any signed-in user with no role yet — this is the "sign-up via `/login` creates a hotel/vendor account" rule. Done via `clerkClient().users.updateUserMetadata()`.
2. Redirect by role: `admin → /admin`, `vendor → /vendor`, anything else (including `customer`) → `/customer`.

Each portal page (`/admin/page.tsx`, `/vendor/page.tsx`, `/customer/page.tsx`) is a server component that re-checks the role via `currentUser()` (not `sessionClaims`, which lag for up to a minute after a metadata write — fatal for the just-signed-up case). The portal UI itself lives in a sibling client component (`AdminPortal.tsx`, `VendorPortal.tsx`, `CustomerPortal.tsx`).

For role-aware redirects to work, the Clerk **session token** must expose `publicMetadata`. In the Clerk dashboard: **Configure → Sessions → Customize session token** add:
```json
{ "metadata": "{{user.public_metadata}}" }
```

Per-user setup in Clerk → user profile → Metadata → Public:
- **Admin**: `{ "role": "admin" }`
- **Vendor (hotel)**: `{ "role": "vendor", "hotelId": "grandpalace" }` — `hotelId` must match a key in `SEED_HOTELS`
- **Customer (travel agent)**: `{ "role": "customer" }` (or unset — that's the default fallback)

### Data flow

- [lib/data.ts](lib/data.ts) — types (`Hotel`, `Room`, `Concern`, `AppStore`), `SEED_HOTELS`, `SEED_CONCERNS`, and the two storage keys (`STORE_KEY = 'krp_v6_store'`, `LS_SYNC_KEY`). Hotel records include `approved: boolean` — only approved hotels appear on the public board.
- [lib/storage.ts](lib/storage.ts) — wraps localStorage. `loadStore()` returns `AppStore { hotels, concerns, version }` and **merges new seed hotels** into existing data on every load (so adding to the seed doesn't wipe edits). `saveStore` bumps `LS_SYNC_KEY` to trigger the cross-tab `storage` event.
- All pages listen for `window.addEventListener('storage', …)` and reload when `LS_SYNC_KEY` changes — vendor edits go live on the public board and customer dashboards instantly across tabs.
- **No rating system anywhere.** No `HotelRating` type, no review moderation, no `StarRating` component. The only "stars" surface is the hotel's intrinsic category (e.g. `5 Star Deluxe`) rendered as a text badge.

### Routes

- [app/page.tsx](app/page.tsx) — public live rates board. Filters approved hotels only. Renders `HotelCard` with Enquire modal.
- [app/login/[[...sign-in]]/page.tsx](app/login/[[...sign-in]]/page.tsx) — Clerk's `<SignIn />` in the branded card; catch-all so Clerk owns sub-routes.
- [app/admin/page.tsx](app/admin/page.tsx) (server) → [app/admin/AdminPortal.tsx](app/admin/AdminPortal.tsx) (client): three tabs — Overview, Hotels (approve/suspend/delete), Concerns (status + response).
- [app/vendor/page.tsx](app/vendor/page.tsx) (server) → [app/vendor/VendorPortal.tsx](app/vendor/VendorPortal.tsx) (client): two tabs — Rooms & Rates (editable inline table + add-row form) and Profile (description, amenities, contact). Resolves the editable hotel from `user.publicMetadata.hotelId`.
- [app/customer/page.tsx](app/customer/page.tsx) (server) → [app/customer/CustomerPortal.tsx](app/customer/CustomerPortal.tsx) (client): three tabs — Browse Rates, Raise a Concern (form posts a `Concern` to localStorage), My Concerns (filtered by `agentEmail === user.primaryEmailAddress`).

### Header

[components/Header.tsx](components/Header.tsx) self-contained: reads Clerk state via hooks (no props). Picks the portal link based on `publicMetadata.role`. Signed-out users see Sign In; signed-in users see Sign Out + a role-specific portal link.

### Design system

The visual layer is the **Via Kashmir "Alpine Editorial" theme** — the canonical reference is the HTML in `/Users/aribanigar/Downloads/via-kashmir-theme-factory.html` (not in this repo). Rules that matter:

- Fonts: **Manrope** (display) + **Inter** (body), loaded via Google Fonts `@import` in [app/globals.css](app/globals.css), not `next/font` — keep it that way so the markup mirrors the theme factory HTML.
- Icons: **Flaticon UIcons** via CDN (`fi fi-rr-*` regular, `fi fi-rs-*` solid). No emojis. `lucide-react` is in `package.json` but new code should prefer Flaticon classes.
- Color tokens are CSS variables (`--vk-primary`, surface hierarchy, etc.) defined in `globals.css` and mirrored in [tailwind.config.ts](tailwind.config.ts).
- Component primitives are CSS classes, not React: `.btn-primary` (gradient CTA), `.btn-secondary`, `.btn-tertiary` (saffron — urgency only), `.btn-danger`, `.btn-ghost`, `.card-elevated`, `.input-field`, `.badge-*`, `.glass-nav`.
- **No 1px sectioning borders** — separate regions with surface-color shifts.
- Responsive layout is driven by `.app-shell`, `.hero-section`, `.stat-grid`, `.form-grid`, `.filter-row`, `.hotel-grid`, `.table-scroll`, `.dash-header`, `.login-shell`, with breakpoints at 900/600/380px. Inline `style={}` props can **not** be overridden by media queries — when adding responsive behavior, route it through a class.

### Path alias

`@/*` maps to the repo root (see [tsconfig.json](tsconfig.json)).

### Deployment

Target: `https://github.com/viakashmir/b2bviakashmir` (Vercel, Hobby plan, `viakashmir` account). Hobby blocks external collaborators, so commits must be authored as `viakashmir <243838831+viakashmir@users.noreply.github.com>` — set `GIT_AUTHOR_NAME` / `GIT_AUTHOR_EMAIL` before committing or amend before pushing, otherwise Vercel will block the build.

Env vars to set in Vercel (and locally in `.env.local`, see `.env.local.example`):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard`
