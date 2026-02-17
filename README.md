# DealBird — Proposals & Invoices for Creator Brand Deals

Professional proposals, e-signatures, and one-click invoicing built for creators.

---

## 🚀 Deploy to Production (Step-by-Step)

Total time: ~25 minutes. You need: a GitHub account and a credit/debit card for Stripe (no charges in test mode).

---

### Step 1: Push to GitHub (~2 min)

1. Go to [github.com/new](https://github.com/new)
2. Name it `dealbird`, set to **Private**, click **Create repository**
3. In your terminal:

```bash
cd dealbird
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dealbird.git
git push -u origin main
```

---

### Step 2: Set Up Neon Database (~3 min)

1. Go to [neon.tech](https://neon.tech) → Sign up free
2. Click **Create Project** → Name it `dealbird`
3. Copy the connection string — it looks like:
   ```
   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this as your `DATABASE_URL`

---

### Step 3: Set Up Google OAuth (~5 min)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project called `DealBird`
3. Go to **APIs & Services → OAuth consent screen**
   - Choose **External**, fill in app name + email, save
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: add `https://your-app.vercel.app/api/auth/callback/google`
     (also add `http://localhost:3000/api/auth/callback/google` for local dev)
5. Copy the **Client ID** and **Client Secret**

---

### Step 4: Set Up Resend for Emails (~2 min)

1. Go to [resend.com](https://resend.com) → Sign up free
2. Go to **API Keys** → Create a key → Copy it
3. (Optional) Add your domain under **Domains** for custom sender address
4. Update `FROM` email in `lib/email.ts` with your verified domain

---

### Step 5: Set Up Stripe (~5 min)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) → Sign up
2. Stay in **Test Mode** (toggle top-right)
3. Go to **Developers → API Keys** → Copy **Secret key** (`sk_test_...`)
4. Create products:
   - Go to **Products → Add Product**
   - Create **"Pro"** at $19/month (recurring) → Copy the **Price ID** (`price_...`)
   - Create **"Agency"** at $149/month (recurring) → Copy the **Price ID**
5. Set up webhook (do this AFTER deploying to Vercel):
   - Go to **Developers → Webhooks → Add endpoint**
   - URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`
   - Copy the **Signing secret** (`whsec_...`)

---

### Step 6: Deploy to Vercel (~5 min)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New → Project**
3. Import your `dealbird` repo
4. Add these **Environment Variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` in terminal |
| `GOOGLE_CLIENT_ID` | From Step 3 |
| `GOOGLE_CLIENT_SECRET` | From Step 3 |
| `RESEND_API_KEY` | From Step 4 |
| `STRIPE_SECRET_KEY` | From Step 5 |
| `STRIPE_WEBHOOK_SECRET` | From Step 5 (add after first deploy) |
| `STRIPE_PRO_PRICE_ID` | From Step 5 |
| `STRIPE_AGENCY_PRICE_ID` | From Step 5 |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

5. Click **Deploy**
6. After deploy, update Google OAuth redirect URI + Stripe webhook URL with your actual Vercel domain

---

### Step 7: Initialize Database (~1 min)

Run once locally to push schema to Neon:

```bash
cp .env.example .env.local
# Fill in .env.local with your real values
npm install
npx prisma db push
```

---

### Step 8: Custom Domain (Optional)

1. In Vercel → Settings → Domains → Add your domain
2. Update DNS as instructed
3. Update `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, Google OAuth URI, and Stripe webhook URL

---

## 🏗 Project Structure

```
dealbird/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Auth (Google + Magic Link)
│   ├── dashboard/
│   │   ├── page.tsx                # Overview with stats
│   │   ├── proposals/
│   │   │   ├── page.tsx            # All proposals
│   │   │   ├── new/page.tsx        # Template picker + builder
│   │   │   └── [id]/page.tsx       # Detail + actions
│   │   ├── invoices/
│   │   │   ├── page.tsx            # All invoices
│   │   │   └── [id]/page.tsx       # Detail + actions
│   │   └── settings/page.tsx       # Profile + billing
│   ├── p/[id]/page.tsx             # Public proposal (brand signs here)
│   ├── inv/[id]/page.tsx           # Public invoice (brand pays here)
│   └── api/                        # All backend routes
├── components/                     # Shared UI components
├── lib/                            # Auth, DB, Stripe, email utilities
├── prisma/schema.prisma            # Database schema
└── public/dealbird-landing.html    # Standalone landing page (v3 design)
```

---

## 🔧 Local Development

```bash
npm install
cp .env.example .env.local  # Fill in your keys
npx prisma db push
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 💰 Stripe Test Cards

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- Any future expiry, any CVC, any ZIP
