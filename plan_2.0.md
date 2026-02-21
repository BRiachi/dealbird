# DealBird 2.0 Master Plan 🚀

This document outlines the step-by-step implementation plan for transforming DealBird into an indispensable "God Mode" tool for creators. Features are ranked by their immediate impact on relieving creator pain and increasing their ROI.

---

## 🥇 Phase 1: The "Pay to Download" Deliverables Engine
**Impact:** Extreme Pain Relief. Stops creators from being ghosted by brands after submitting final assets.
**How it works:** Creators upload the final high-res video (MP4) or image directly to the DealBird invoice. Brands can view a heavily watermarked version or a thumbnail, but the download link is locked until the Stripe invoice is fully paid.

### Step-by-Step Build:
1. **Supabase Storage Setup:** Create a secure bucket in Supabase for `deliverables` with RLS (Row Level Security) ensuring only the creator and the authenticated invoice viewer can access the file data.
2. **Creator Upload UI:** On the `Invoice Creation`/`Edit` page, add a sleek drag-and-drop zone: "Upload Final Deliverables (Locked until payment)."
3. **Database Schema Update:** Add a `deliverables` JSONB array to the `Invoices` table containing file URLs, names, and sizes.
4. **Watermark / Low-Res Preview (Optional MVP):** Initially, simply prevent downloading. Later, use a background job to generate a watermarked preview.
5. **Brand View UI (`/inv/[id]`):** Update the public invoice page. Display the uploaded files in a "Locked Assets" section. The download button should be disabled and say "Unlocks upon payment."
6. **Webhook Magic (`api/webhooks/stripe`):** When the `invoice.paid` or `checkout.session.completed` event fires, update the invoice status to `paid` and immediately email the brand the unlocked, expiring presigned S3/Supabase download links.

---

## 🥈 Phase 2: 1-Click Upsells on Proposals
**Impact:** High ROI. Directly increases the creator's Average Order Value (AOV) via impulse buys.
**How it works:** Creators add optional add-ons to their standard packages (e.g., +$500 for 30-day usage rights, +$250 for Link-in-Bio placement). Brands can check these boxes right before accepting the proposal.

### Step-by-Step Build:
1. **Database Schema Update:** Create a new table `AddOns` linked to a `Proposal` or `Package`. Fields: `id`, `name`, `price`, `description`.
2. **Creator UI (`/dashboard/proposals/new`):** Add an "Upsells / Add-ons" section below the main package pricing. Let creators define the name and price of optional extras.
3. **Brand View UI (`/p/[id]`):** On the public proposal page, right above the Total Price and "Accept" button, display a beautiful interactive checklist of the available add-ons. 
4. **Dynamic Pricing Logic:** As the brand checks/unchecks an add-on, dynamically update the `Total Amount` shown on the screen.
5. **Checkout Handoff:** Ensure the final selected add-ons are included in the line items passed to Stripe Checkout when the brand proceeds to payment.

---

## 🥉 Phase 3: Dynamic "Scarcity & Urgency" Proposals
**Impact:** High Conversion Rate. Psychology-driven features to force brands to make quicker decisions.
**How it works:** Adding countdown timers for proposal validity and showing limited inventory availability.

### Step-by-Step Build:
1. **Database Schema Update:** Add `expiresAt` (timestamp) and `inventorySpots` (integer) to the `Proposals` table.
2. **Creator UI:** Add fields for "Valid Until" (date picker) and "Limited Spots" when drafting a proposal.
3. **Brand View UI (`/p/[id]`):**
   - If `expiresAt` exists, render a sleek "Valid for: 48h 12m" countdown component at the top of the proposal.
   - If `inventorySpots` is set, show a stylized badge "🔥 Only 2 spots remaining this month."
4. **Expiration Enforcement:** If `Date.now() > expiresAt`, disable the "Accept Proposal" button and display a "This proposal has expired. Please contact the creator" overlay.

---

## 🏅 Phase 4: Automated "Bad Cop" Drip Campaigns
**Impact:** High Pain Relief. Eliminates the awkwardness of creators begging multi-billion dollar companies to pay their overdue $2k invoices.
**How it works:** DealBird sends automated, escalating email reminders based on how late the invoice is.

### Step-by-Step Build:
1. **Database Schema Update:** Add `dueDate`, `reminderSchedule` (boolean), and `lastReminderSentAt` to the `Invoices` table.
2. **Creator UI:** Add a toggle in Settings and on the Invoice creation page: "[x] Enable Auto-Reminders."
3. **Cron Job / Background Worker:** Set up a daily cron job (via Vercel Cron or Trigger.dev) that queries the database for unpaid invoices where `dueDate < Today`.
4. **Email Templates (Resend):**
   - **Tier 1 (3 Days Late):** "Friendly reminder: Invoice #123 is due."
   - **Tier 2 (14 Days Late):** "Action Required: Invoice #123 is significantly overdue."
   - **Tier 3 (30 Days Late):** "Final Notice: Account placed on hold until Invoice #123 clears."
5. **Execution:** The cron job triggers the Resend API to fire these emails automatically, updating `lastReminderSentAt` to prevent duplicate sends.

---

## 💎 Phase 5: The "Live Media Kit" Storefront
**Impact:** Vanity & Professionalism. Makes the creator look like a premium enterprise.
**How it works:** Connect social APIs so the `/u/[handle]` storefront displays real-time followers, average engagement, and views. 

### Step-by-Step Build:
1. **OAuth Integrations:** Integrate NextAuth or direct OAuth flows for YouTube, Instagram (Facebook Graph API), and TikTok.
2. **Data Sync Job:** Create a background job that pulls updated metrics for connected accounts every 24 hours and stores them in a `SocialStats` table.
3. **Storefront UI (`/u/[handle]`):** Replace static, manually entered follower counts with live, verified badges (e.g., "✅ 1.2M YouTube Subscribers (Live)").
4. **"Book a Call" Widget:** Integrate a simple Calendly-style booking component directly into the storefront that captures the brand's budget, product link, and email before allowing them to book a 15-minute intro call.

---

## 🔮 Phase 6: Split Payments (Viral "Feature")
**Impact:** Heavy Word-of-Mouth Growth. Pulls talent managers and video editors into the DealBird ecosystem.
**How it works:** A creator can automatically route 20% of an invoice to their manager, or a flat $500 to their video editor.

### Step-by-Step Build:
1. **Stripe Connect Setup:** (Already partially built in DealBird!). Ensure the main DealBird platform can create `Transfers` between connected accounts.
2. **Payee Onboarding:** Create a flow for managers/editors to connect their own bank accounts to DealBird via Stripe.
3. **Invoice Creation UI:** Add a "Split Payment" section. E.g., select Payee: `alex@manager.com`, Amount: `20%`.
4. **Webhook Logic (`api/webhooks/stripe`):** Upon invoice payment, calculate the percentage or flat fees and execute Stripe `Transfers` to the connected payee accounts before routing the final balance to the primary creator.

---

## 🚀 Recommended Next Steps:
The highest leverage choice right now is **Phase 1: "Pay to Download" Deliverables Engine**. It actively solves a massive pain point that competitors (like Stan Store or standard Stripe invoicing) don't handle natively for brand deals. 

Do you want to begin implementing Phase 1?
