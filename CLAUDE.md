# DealBird — Project Guide

## What This Is

DealBird is a SaaS platform for creators to manage brand deals. The primary moat vs competitors (Stan.store, Linktree) is **Proposals with e-signatures + Invoicing with locked deliverables** — no other creator platform has this.

**Live URL:** https://dealbird.ai
**Creator storefronts:** https://dealbird.ai/u/[handle]

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Neon) + Prisma 5 |
| Auth | NextAuth (Google OAuth, JWT strategy) |
| Payments | Stripe (Checkout, Connect for creator payouts) |
| Email | Resend (transactional emails) |
| File Uploads | UploadThing |
| Drag & Drop | @dnd-kit |
| Charts | Recharts |
| Deployment | Vercel |

---

## Project Structure

```
app/
├── api/                    # API routes (all use getServerSession for auth)
│   ├── analytics/          # Dashboard analytics
│   ├── appointments/       # Coaching product availability & slots
│   ├── auth/[...nextauth]/ # NextAuth handler
│   ├── bookings/           # Cancel/manage bookings
│   ├── checkout/           # Stripe checkout session creation
│   ├── courses/            # Course CRUD + student learn API
│   ├── cron/               # Invoice reminders, proposal expiry
│   ├── emails/             # Email log retrieval
│   ├── invoices/           # Invoice CRUD + pay + deliverables
│   ├── products/           # Product CRUD + reorder
│   ├── proposals/          # Proposal CRUD + sign + view tracking
│   ├── stripe/             # Webhooks, Connect OAuth, subscription checkout
│   ├── uploadthing/        # File upload endpoints
│   └── user/               # User profile updates
├── dashboard/              # Authenticated creator dashboard
│   ├── analytics/          # Store performance
│   ├── bookings/           # Bookings + Appointments (tabbed)
│   ├── courses/[productId] # Course builder (modules/lessons)
│   ├── customers/          # Customers + Audience (tabbed)
│   ├── emails/             # Email send history
│   ├── income/             # Combined revenue view
│   ├── invoices/           # Invoice list + detail
│   ├── links/              # Link-in-Bio product editor (main product management)
│   ├── proposals/          # Proposal list + builder + detail
│   ├── referrals/          # Affiliate program
│   └── settings/           # Profile, Design, Pixels, Payouts (tabbed)
├── learn/[productId]/      # Student course viewer
├── p/[id]/                 # Public proposal view (brand-facing)
├── inv/[id]/               # Public invoice view (brand-facing)
└── u/[handle]/             # Creator storefront (public)
```

### Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema (all models) |
| `lib/auth.ts` | NextAuth config (Google OAuth + dev credentials) |
| `lib/email.ts` | Resend email templates |
| `lib/stripe.ts` | Stripe client singleton |
| `lib/prisma.ts` | Prisma client singleton |
| `lib/sanitize.ts` | HTML sanitizer for user-generated content |
| `lib/stripe-connect-state.ts` | HMAC state signing for Stripe Connect OAuth |
| `lib/utils.ts` | Shared utilities (cn, formatCurrency, formatDate) |
| `components/dashboard-sidebar.tsx` | Sidebar navigation |
| `components/settings-form.tsx` | Settings form (profile, design, pixels) |
| `middleware.ts` | Pathname header + affiliate cookie |

---

## Database Models (Prisma)

- **User** — Creator account with profile, theme, subscription plan, Stripe Connect
- **Product** — 6 types: DIGITAL, URL, COACHING, COLLECT_EMAIL, COURSE, MEMBERSHIP
- **Order** — Purchase record with buyer info, affiliate attribution
- **Proposal** — Brand deal proposal with line items, add-ons, e-signature, view analytics
- **ProposalItem / ProposalAddOn** — Line items and optional upsells
- **ProposalView** — Per-view analytics (IP, user agent, referrer, time spent)
- **Invoice** — Payment request with items, due dates, reminder tracking, deliverables
- **Course / CourseModule / CourseLesson** — LMS structure
- **AppointmentProfile / Booking** — Coaching scheduling
- **EmailLog** — Audit trail for all sent emails

---

## Conventions

### Code Style
- Use `@/` path alias for imports (maps to project root)
- Use Tailwind CSS for all styling (no CSS modules)
- Use `cn()` from `@/lib/utils` for conditional classnames
- Server components by default; add `"use client"` only when needed
- API routes use `getServerSession(authOptions)` for auth checks
- All API routes must verify ownership: `where: { id, userId: session.user.id }`

### Security Rules
- **Never pass full Prisma results to client** — always use `select` on public-facing queries
- **Sanitize pixel IDs** — only alphanumeric, dashes, underscores (validated on save + render)
- **Sanitize user HTML** — use `sanitizeHtml()` from `lib/sanitize.ts` before `dangerouslySetInnerHTML`
- **Never trust Origin header** — use `process.env.NEXT_PUBLIC_APP_URL` for redirect URLs
- **Never expose internal error messages** — return generic errors to clients, log details server-side
- **Stripe Connect OAuth** — state parameter is HMAC-signed, verified in callback
- **Cron endpoints** — reject if CRON_SECRET is undefined or < 16 characters
- **.env never committed** — gitignored, contains live Stripe/DB/OAuth keys

### Dashboard Layout
- Sticky nav = 64px (h-16)
- Desktop: sidebar 220px + main content with `lg:mt-16` + `py-8` padding
- Total vertical offset: desktop = 192px, mobile = 96px
- Max content width: 1120px

### Known Issues
- `.next` cache corruption: when seeing "Cannot find module './XXXX.js'", run `rm -rf .next && npx next dev`
- Settings form fetches from `/api/user/profile` (not `/api/user`) — this was a past bug fix

---

## Subscription Plans

| Plan | Price | Fee |
|------|-------|-----|
| Free | $0/mo | Platform fee on transactions |
| Pro | $19/mo | Reduced fees |
| Agency | $149/mo | Lowest fees |

Stan.store comparison: $0 (5% fee) or $29/mo (0% fee)

---

## Feature Roadmap (plan_2.0.md)

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Pay-to-Download Deliverables | DONE |
| 2 | 1-Click Proposal Add-Ons/Upsells | DONE |
| 3 | Scarcity/Urgency (countdown, expiry) | DONE |
| 4 | Automated "Bad Cop" Drip Campaigns | NOT STARTED |
| 5 | Live Media Kit (social API integration) | NOT STARTED |
| 6 | Split Payments (managers, editors) | NOT STARTED |

### Competitive Gaps (Priority Order)
1. Email broadcast tool (biggest gap — only a log viewer exists)
2. Custom domains for storefronts
3. Coupon/discount codes
4. Recurring subscription billing
5. Google Calendar sync for appointments

### What DealBird Has That Stan Doesn't
- Proposals with e-signature + view analytics (IP, duration, referrer)
- Invoicing with Stripe payment links + locked deliverables
- Multi-platform pixel management (Meta, TikTok, Google, Snapchat, Pinterest)
- Combined income view (sales + invoices in one ledger)
- Affiliate program with per-product commission rates

---

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:push      # Push schema changes to database
npm run db:generate  # Regenerate Prisma client
npm run db:studio    # Open Prisma Studio
```

---

## Environment Variables

Required in `.env` (never commit this file):
- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXTAUTH_URL` — App URL (http://localhost:3000 in dev)
- `NEXTAUTH_SECRET` — JWT signing secret
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — Stripe API keys
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signature verification
- `STRIPE_CLIENT_ID` — Stripe Connect OAuth client ID
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL` — Email sending
- `CRON_SECRET` — Cron job authentication (min 16 chars)
- `UPLOADTHING_TOKEN` — File upload service token
- `NEXT_PUBLIC_APP_URL` — Public app URL (only NEXT_PUBLIC_ var)
