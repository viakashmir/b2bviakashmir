# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run start` — run the built app
- `npm run lint` — `next lint`

No test runner is configured. There is no separate typecheck script — use `next build` or `npx tsc --noEmit`.

## Architecture

**Next.js 14 App Router · TypeScript · Tailwind**. Auth is Clerk with three roles: `admin`, `vendor`, `customer`. Hotel + concern data lives entirely in browser `localStorage` (no database).

### Auth / role routing (the only place this lives)

The role architecture follows Clerk's standard recipe exactly. **Do not reintroduce `currentUser()` or `clerkClient` mutations anywhere except `app/signup/complete/page.tsx`.**

1. **Roles live in `publicMetadata.role`** on each Clerk user. Admin sets these manually in Clerk Dashboard → User → Metadata → Public.
2. **Clerk session token MUST expose `publicMetadata`.** In Clerk Dashboard → Configure → Sessions → Customize session token, add:
   ```json
   { "metadata": "{{user.public_metadata}}" }
   ```
   Without this, `sessionClaims.metadata` is undefined and every authed user falls through to the default route.
3. **[middleware.ts](middleware.ts)** is the single redirect router. On `/dashboard` it reads `sessionClaims.metadata.role` and forwards to `/admin`, `/vendor`, or `/customer`. **The default fallback (missing role) is `/vendor`** — because new sign-ups happen via `/signup` (hotel onboarding), and we default-route them to the hotel portal.
4. **Each portal page** ([app/admin/page.tsx](app/admin/page.tsx), [app/vendor/page.tsx](app/vendor/page.tsx), [app/customer/page.tsx](app/customer/page.tsx)) is a server component that re-reads `sessionClaims.metadata.role` and redirects back to `/dashboard` if the role doesn't match. The vendor portal additionally lets users with **no role yet** through, so freshly-signed-up hotels see their portal immediately.
5. The UI for each portal is a sibling client component: `AdminPortal.tsx`, `VendorPortal.tsx`, `CustomerPortal.tsx`.

### Sign-up flow

- `/signup` ([app/signup/[[...sign-up]]/page.tsx](app/signup/%5B%5B...sign-up%5D%5D/page.tsx)) hosts Clerk's `<SignUp />` for hotel registration. Clerk's `forceRedirectUrl` points at `/signup/complete`.
- `/signup/complete` ([app/signup/complete/page.tsx](app/signup/complete/page.tsx)) is a tiny server component that calls `clerkClient().users.updateUserMetadata` to set `publicMetadata.role = 'vendor'`, then `redirect('/dashboard')`. This is the **only** server-side metadata write in the app.
- `/login` ([app/login/[[...sign-in]]/page.tsx](app/login/%5B%5B...sign-in%5D%5D/page.tsx)) hosts Clerk's `<SignIn />`. After sign-in, Clerk redirects to `/dashboard`; middleware routes by role.

### Header

[components/Header.tsx](components/Header.tsx) reads `useUser().publicMetadata.role` on the client. Signed-out users see **Register Hotel** (→ `/signup`) + **Hotel Login** (→ `/login`). Signed-in users see a portal link picked by role, plus **Sign Out**.

### Data flow

- [lib/data.ts](lib/data.ts) — types (`Hotel`, `Room`, `Concern`, `AppStore`), `SEED_HOTELS`, `SEED_CONCERNS`, and the storage keys (`STORE_KEY = 'krp_v7_store'`, `LS_SYNC_KEY`). Hotel records include `approved: boolean`; only approved hotels appear on the public board. Room rates are stored as `double`, `cnb` (Child No Bed), `extraBed`. There are no `single` or `triple` fields.
- [lib/storage.ts](lib/storage.ts) — wraps localStorage. `loadStore()` returns `AppStore { hotels, concerns, version }` and **merges new seed hotels** into existing data on every load (so adding to the seed doesn't wipe vendor edits). `saveStore` bumps `LS_SYNC_KEY` to trigger the cross-tab `storage` event.
- All pages listen for `window.addEventListener('storage', …)` and reload when `LS_SYNC_KEY` changes — vendor edits go live on the public board and across other tabs instantly.
- **No rating system anywhere.** No `HotelRating` type, no review moderation. The only "stars" surface is the hotel's intrinsic category (e.g. `5 Star Deluxe`) rendered as a text badge.

### Vendor ↔ hotel mapping

A vendor user is linked to a specific hotel record by `publicMetadata.hotelId` on the Clerk user (string key matching a `SEED_HOTELS` entry, case-insensitive). [VendorPortal.tsx](app/vendor/VendorPortal.tsx) reads `user.publicMetadata.hotelId` and edits that hotel. If `hotelId` is unset or unknown, the portal shows a friendly "Hotel not linked" notice instead of crashing — admin must set the mapping in Clerk Dashboard.

### Design system

Visual reference is the **Via Kashmir "Alpine Editorial" theme** (HTML at `/Users/aribanigar/Downloads/via-kashmir-theme-factory.html`, not in this repo). Rules:

- Fonts: **Manrope** (display) + **Inter** (body), loaded via Google Fonts `@import` in [app/globals.css](app/globals.css), not `next/font`.
- Icons: **Flaticon UIcons** via CDN (`fi fi-rr-*` regular, `fi fi-rs-*` solid). No emojis. `lucide-react` is in `package.json` but prefer Flaticon classes for new code.
- Color tokens are CSS variables (`--vk-primary`, surface hierarchy, etc.) defined in `globals.css` and mirrored in [tailwind.config.ts](tailwind.config.ts).
- Component primitives are CSS classes, not React components: `.btn-primary` (gradient CTA), `.btn-secondary`, `.btn-tertiary` (saffron — urgency only), `.btn-danger`, `.btn-ghost`, `.card-elevated`, `.input-field`, `.badge-*`, `.glass-nav`.
- **No 1px sectioning borders** — separate regions with surface-color shifts.
- Responsive layout is driven by classes in `globals.css` (`.app-shell`, `.hero-section`, `.stat-grid`, `.form-grid`, `.filter-row`, `.hotel-grid`, `.table-scroll`, `.dash-header`, `.login-shell`) with breakpoints at 900/600/380px. Inline `style={}` props can **not** be overridden by media queries — for responsive behaviour, route through a class.

### Path alias

`@/*` maps to the repo root (see [tsconfig.json](tsconfig.json)).

### Deployment

- Target repo: `https://github.com/viakashmir/b2bviakashmir` deployed via Vercel under the `viakashmir` account, Hobby plan.
- Hobby blocks external collaborators, so commits **must** be authored as `viakashmir <243838831+viakashmir@users.noreply.github.com>`. Set `GIT_AUTHOR_NAME` / `GIT_AUTHOR_EMAIL` or amend before pushing, otherwise Vercel blocks the build with "commit author did not have contributing access".
- Custom domain `b2b.viakashmiritinerary.in` is attached to the `b2bviakashmir-tq4j` Vercel project.

### Env vars

In `.env.local` and Vercel project Settings → Environment Variables (see `.env.local.example`):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/signup/complete`

### Production Clerk DNS

Live Clerk keys (`pk_live_*`) require DNS records (CNAMEs) for the Clerk subdomains under `b2b.viakashmiritinerary.in` — without them, sign-in cookies cannot be set and users loop back to `/login`. Find the exact records in Clerk Dashboard → Domains. Until DNS verifies, swap in dev keys (`pk_test_*`) to unblock local + preview testing.
