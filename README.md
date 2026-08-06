# Chico Water Limited — Website & Operations Platform

A full-stack Next.js 14 web platform for Chico Water Limited Company, Ghana's premium water supplier.

## Features

### Public Website
- 🌊 Hero landing page with animated order tracking card
- 📦 Products catalogue with tiered pricing (Household / Retail / Wholesale / Corporate)
- 🛒 Multi-step order placement form (5 steps: Category → Products → Delivery → Payment → Confirm)
- 📍 Real-time order tracking by order number
- 📖 About us, Contact pages
- 📱 Fully mobile responsive

### Operations
- 🔐 Custom JWT auth (no Supabase Auth — your own system)
- 👤 Customer dashboard (order history, reorder, tracking)
- 🧑‍💼 Salesperson dashboard (accept/reject orders, update status, download receipts)
- 🏢 Admin dashboard (all orders, inventory, analytics, revenue charts)
- 📊 Revenue by segment, weekly bar chart
- ⚠️ Low stock alerts

### Technical
- Next.js 14 App Router + TypeScript
- Tailwind CSS with custom design system
- Supabase (PostgreSQL database)
- Custom JWT auth with bcrypt
- Framer Motion animations
- react-hot-toast notifications
- Mobile Money, card, cash payment flow

---

## Setup

### 1. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure environment

Copy \`.env.local\` and fill in your values:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-long-random-secret
NEXT_PUBLIC_APP_URL=http://localhost:6001
\`\`\`

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Paste and run the contents of `supabase-schema.sql`
4. Copy your Project URL and anon key to `.env.local`

### 4. Run the dev server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:6001](http://localhost:6001)

---

## Demo Accounts

| Role | Email | Password | Redirects to |
|------|-------|----------|--------------|
| Admin | admin@chicowater.com | admin123 | /dashboard/admin |
| Salesperson | sales@chicowater.com | sales123 | /dashboard/sales |
| Customer | customer@chicowater.com | customer123 | /dashboard/customer |

## Demo Orders (for tracking)

| Order # | Customer | Status |
|---------|----------|--------|
| CW-10421 | Kwame Mensah | Confirmed |
| CW-10422 | Abena Owusu | In Transit |
| CW-10420 | Kofi Asante | Delivered |

---

## Project Structure

\`\`\`
chico-water/
├── app/
│   ├── page.tsx              # Homepage
│   ├── products/             # Products catalogue
│   ├── order/                # Order placement (5-step form)
│   ├── track/                # Order tracking
│   ├── about/                # About page
│   ├── contact/              # Contact page
│   ├── auth/
│   │   ├── login/            # Login page
│   │   └── register/         # Registration
│   └── dashboard/
│       ├── admin/            # Admin dashboard
│       ├── sales/            # Salesperson dashboard
│       └── customer/         # Customer portal
├── components/
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── auth.ts               # JWT auth utilities
│   ├── utils.ts              # Helpers, formatters
│   └── mock-data.ts          # Demo data
├── types/
│   └── index.ts              # TypeScript types
└── supabase-schema.sql       # Database schema
\`\`\`

---

## Deployment

### Vercel (recommended)
\`\`\`bash
npm i -g vercel
vercel
\`\`\`
Add your environment variables in the Vercel dashboard.

### Add WhatsApp Notifications
1. Get access to WhatsApp Business Cloud API or use Twilio
2. Add `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_ID` to `.env.local`
3. In `/app/api/orders/route.ts`, call the WA API after order creation

### Add SMS (SMSOnlineGH)
1. Register at smsonlinegh.com
2. Add `SMSGH_API_KEY` to `.env.local`
3. In `/app/api/orders/route.ts`, send SMS on order confirmation

---

## Next Steps
- [ ] Connect Supabase — replace mock-data.ts with real DB queries
- [ ] Add Paystack payment gateway integration
- [ ] Add WhatsApp Business API notification to salesperson
- [ ] Add PDF receipt generation (pdfmake or Puppeteer)
- [ ] Add route optimization for drivers
- [ ] Add subscription/recurring order scheduling
\`\`\`
