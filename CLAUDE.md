# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run start` — run the built app
- `npm run lint` — `next lint`

No test runner. No separate typecheck — use `next build` or `npx tsc --noEmit`.

## Architecture

**Next.js 14 App Router · TypeScript · Tailwind · Supabase · Clerk.** Hotel/room/concern data lives in a Supabase Postgres database. All client pages fetch via `/api/*` and subscribe to real-time `postgres_changes` channels for live updates. There are **no seeds** and **no localStorage** — the app starts empty and fills as real users sign up.

### Roles (Clerk recipe — do not over-engineer)

1. Roles live in `publicMetadata.role` on each Clerk user.
2. Clerk session token MUST expose `publicMetadata`. In Clerk Dashboard → Configure → Sessions → Customize session token:
   ```json
   { "metadata": "{{user.public_metadata}}" }
   ```
3. [middleware.ts](middleware.ts) reads `sessionClaims.metadata.role` and redirects `/dashboard` → `/admin` | `/vendor` | `/customer`. Default fallback is `/vendor` (new sign-ups go there).
4. Each portal page double-checks `sessionClaims.metadata.role` server-side and bounces back to `/dashboard` if wrong.
5. Sign-up flow: `/signup` → Clerk `<SignUp />` with `forceRedirectUrl=/signup/complete` → server route writes `publicMetadata.role = 'vendor'` via `clerkClient` (the **only** server-side metadata write in the app).

### Database (Supabase)

- Base schema is [supabase/schema.sql](supabase/schema.sql), then **numbered migrations `0001`–`0004` applied in order** (each is idempotent — `if not exists` / `add column if not exists`). Run the base file once, then each migration, in Supabase Dashboard → SQL Editor. Migrations add: `0001` property_type, `0002` `inventory_blocks` table, `0003` per-meal-plan pricing on rooms, `0004` `whatsapp_phone` column + `enquiries` table.
- Five tables: `hotels`, `rooms`, `concerns`, `inventory_blocks` (vendor date-range room blocks behind the availability calendar), `enquiries` (logged WhatsApp enquiries from the public board).
- **Row Level Security**: public can `SELECT` only approved hotels and their rooms. `concerns`, `inventory_blocks`, and `enquiries` are **never** publicly readable. All writes (and reads of unapproved/private data) go through Next.js API routes that use the **service-role key** server-side, after Clerk auth checks.
- Real-time: `hotels` and `rooms` are added to the `supabase_realtime` publication so client subscriptions fire on every insert/update/delete.

### Vendor ↔ hotel mapping

Hotel id is derived from the Clerk user id: **`vendor_<lowercased-userId>`**. No admin metadata step. Each vendor owns exactly one hotel; the row id equals their derived hotel id. API routes enforce this — `/api/hotels/me/*` always operates on the caller's derived hotel id.

### API routes (`/app/api/...`)

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/hotels` | GET | public | Approved hotels + rooms for the public board |
| `/api/hotels/me` | GET, POST | vendor | Fetch / upsert vendor's own hotel (used by onboarding + Profile tab) |
| `/api/hotels/me/rooms` | POST | vendor | Add a room |
| `/api/hotels/me/rooms/[roomId]` | PUT, DELETE | vendor | Update / delete a room |
| `/api/vendor/inventory/calendar` | GET | vendor | Per-day availability for the month (rooms minus overlapping blocks, plus tariff window) |
| `/api/vendor/inventory/blocks` | POST | vendor | Create a date-range inventory block |
| `/api/vendor/inventory/blocks/[id]` | DELETE | vendor | Remove a block |
| `/api/admin/hotels` | GET | admin | All hotels (incl. pending) |
| `/api/admin/hotels/[id]` | PATCH, DELETE | admin | Approve/suspend, delete |
| `/api/concerns` | GET, POST | admin / customer | List (filtered by role) / raise |
| `/api/concerns/[id]` | PATCH | admin | Update status, send response |
| `/api/enquiries` | GET, POST | admin / **public** | Admin lists enquiries; POST is public — logs the row, fires emails, returns a `wa.me` deep-link the client opens |

Routes that mutate transactional state fire **best-effort emails** via [lib/email.ts](lib/email.ts) (Resend). Email sends never block or fail the request — a missing `RESEND_API_KEY` just logs and skips. All branded HTML is built in `lib/email.ts`; API routes only call the exported `email*` trigger functions.

### Client data layer

- [lib/supabase.ts](lib/supabase.ts) — `browserSupabase()` (anon key, for real-time subscriptions) and `serverSupabase()` (service role; **never import server-side from client code**).
- [lib/data.ts](lib/data.ts) — types, constants, snake_case ↔ camelCase mappers (`rowToHotel`, `rowToRoom`, `rowToConcern`, `rowToEnquiry`), and pure formatters (`fmtINR`, `fmtDate`, `timeAgo`, `bestStatus`, `availableInventory`, etc.). No business logic, no I/O.
- [lib/email.ts](lib/email.ts) — server-only Resend layer: branded HTML shell plus `emailListingSubmitted`, `emailHotelApproved`, `emailHotelSuspended`, `emailEnquirySent`, `emailConcernRaised`, `emailConcernResponded`. Never import from client code.

Pages **never** call Supabase directly for writes — they always go through `/api/*`. They DO call `browserSupabase()` to subscribe to `postgres_changes` channels for real-time refresh.

### Onboarding flow

[app/vendor/OnboardingFlow.tsx](app/vendor/OnboardingFlow.tsx) is a typeform-style wizard (~8 steps; Tariff + Rates merged into one required step) that runs when a vendor has no hotel record yet. On submit it POSTs to `/api/hotels/me`, which creates the hotel row with `approved=false`. Admin must approve before the listing appears on the public board.

### Inventory calendar & enquiries

- Vendors manage availability in [app/vendor/inventory/InventoryCalendar.tsx](app/vendor/inventory/InventoryCalendar.tsx): the calendar route computes each day's status (`available` / `partial` / `full` / `past`) as room `inventory` minus overlapping `inventory_blocks`. A block with `room_id = null` applies to every room. Blocks carry a `source` (`vendor_manual` | `ical_import`) for future OTA iCal sync.
- On the public board, travellers open `<EnquireWhatsAppModal />`, which POSTs to `/api/enquiries`. The server validates an Indian 10-digit mobile (`+91`, leading `6-9`), logs the row, emails admin + vendor, and returns a pre-filled `wa.me` link the client opens. Hotel contact priority: `whatsapp_phone` → `phone`.

### Design system

Visual reference: Via Kashmir "Alpine Editorial" theme (HTML at `/Users/aribanigar/Downloads/via-kashmir-theme-factory.html`, not in this repo).

- **Manrope** display, **Inter** body — loaded via Google Fonts `@import` in [app/globals.css](app/globals.css), not `next/font`.
- Icons: **Flaticon UIcons** via CDN (`fi fi-rr-*` regular, `fi fi-rs-*` solid, also `fi fi-br-*` bold) for class-based markup, plus **`lucide-react`** components used across the portals. No emojis.
- Color tokens are CSS variables in `globals.css`, mirrored in [tailwind.config.ts](tailwind.config.ts).
- Class-based primitives: `.btn-primary` (gradient CTA), `.btn-secondary`, `.btn-tertiary`, `.btn-danger`, `.btn-ghost`, `.card-elevated`, `.input-field`, `.badge-*`.
- **No 1px sectioning borders** — separate regions with surface-color shifts.
- Responsive via classes (`.app-shell`, `.hero-section`, `.stat-grid`, `.form-grid`, `.filter-row`, `.hotel-grid`, `.table-scroll`) with breakpoints at 900/600/380px.
- Brand mark: `public/logo.svg` (rendered by `<ViaKashmirLogo />`). Favicon: `app/icon.svg`.

### Env vars

Set in `.env.local` and Vercel Project Settings:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/signup/complete

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Resend (transactional email) — all optional; absent key disables sends
RESEND_API_KEY
EMAIL_FROM        # verified sender, e.g. 'Via Kashmir <noreply@viakashmiritinerary.in>'
ADMIN_EMAIL       # inbox for admin notifications
APP_URL           # canonical site URL used in email CTAs
```

Live Clerk keys (`pk_live_*`) require DNS records for the Clerk subdomains under your production domain — otherwise sign-in cookies cannot be set and users loop back to `/login`. See Clerk Dashboard → Domains.

### Deployment

GitHub repo: `https://github.com/viakashmir/b2bviakashmir`. Vercel project: `b2bviakashmir-tq4j` under the `viakashmir` account, Hobby plan. Custom domain: `b2b.viakashmiritinerary.in`.

Commits must be authored as `viakashmir <243838831+viakashmir@users.noreply.github.com>` or Vercel blocks the build ("commit author did not have contributing access").

### Path alias

`@/*` maps to the repo root (see [tsconfig.json](tsconfig.json)).
