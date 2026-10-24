# AR Books — Asmit Rajaramkar Personal Author Website & eBook Store

A complete, production-ready personal author website and eBook e-commerce platform built with Next.js 16, Firebase, and Razorpay.

---

## Tech Stack

- **Frontend**: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4
- **Auth**: Firebase Authentication (email/password + Google Sign-In)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage (private PDFs)
- **Payments**: Razorpay Standard Checkout
- **Email**: Resend
- **Hosting**: Vercel

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd ar-books
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`. See the sections below for each service.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Firebase Setup

### Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project.
2. Enable **Authentication** → Sign-in methods → **Email/Password** and **Google**.
3. Enable **Firestore Database** in production mode.
4. Enable **Storage** in production mode.

### Get client config

In Firebase Console → Project Settings → Your apps → Web app → SDK config.  
Copy the values into your `.env.local` as `NEXT_PUBLIC_FIREBASE_*`.

### Get Admin SDK credentials

In Firebase Console → Project Settings → Service accounts → Generate new private key.  
This downloads a JSON file. Extract:
- `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
- `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
- `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (keep `\n` as literal `\n`, wrap in quotes)

### Firestore Security Rules

In Firebase Console → Firestore → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public read for published books and visible categories
    match /books/{bookId} {
      allow read: if resource.data.published == true;
      allow write: if false;
    }
    match /categories/{catId} {
      allow read: if resource.data.visible == true;
      allow write: if false;
    }
    match /articles/{articleId} {
      allow read: if resource.data.published == true;
      allow write: if false;
    }
    match /settings/store {
      allow read: if true;
      allow write: if false;
    }

    // Users can read/write only their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Orders — owner read only
    match /orders/{orderId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.customerId;
      allow write: if false;
    }

    // Download entitlements — owner read only
    match /downloadEntitlements/{entId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.customerId;
      allow write: if false;
    }

    // All other collections — server-side only (Admin SDK bypasses rules)
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Storage Security Rules

In Firebase Console → Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Book covers — public read
    match /covers/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
    // All other files (PDFs) — no public access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Provision an Admin Account

1. Register a normal account on the website (or create one in Firebase Console).
2. Run the provisioning script:

```bash
npx ts-node --project tsconfig.json scripts/provision-admin.ts your@email.com
```

3. Sign out and sign back in at `/admin/login`.

**Never grant admin access through a public form or browser-submitted data.**

---

## Seed Development Data

```bash
npx ts-node --project tsconfig.json scripts/seed.ts
```

This creates sample categories, books, and store settings. Run only in development.

---

## Razorpay Setup

### Test mode (development)

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Go to Settings → API Keys → Generate Test Key.
3. Copy `Key ID` → `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
4. Copy `Key Secret` → `RAZORPAY_KEY_SECRET`.

### Webhooks

1. In Razorpay Dashboard → Webhooks → Add new webhook.
2. URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Events: `payment.captured`
4. Copy the webhook secret → `RAZORPAY_WEBHOOK_SECRET`.

### Live mode (production)

Replace test keys with live keys. Complete Razorpay KYC before going live.

---

## Email Setup (Resend)

1. Sign up at [Resend](https://resend.com).
2. Add and verify your sending domain.
3. Create an API key → `RESEND_API_KEY`.
4. Set `EMAIL_FROM` to a verified sender address on your domain.

---

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add all environment variables from `.env.local` in Vercel → Settings → Environment Variables.
4. Deploy.

### Important production settings

- `NODE_ENV` is automatically set to `production` by Vercel.
- Session cookies use `secure: true` in production automatically.
- Never commit `.env.local` to version control.

---

## Project Structure

```
src/
├── app/
│   ├── (public pages)     — /, /books, /about, /contact, /articles, /search
│   ├── admin/             — /admin/login, /admin/dashboard, /admin/books, etc.
│   ├── account/           — /account/dashboard, /account/library, /account/orders, etc.
│   └── api/               — Route handlers (auth, checkout, downloads, webhooks, admin)
├── components/
│   ├── layout/            — SiteHeader, SiteFooter
│   ├── book/              — BookCard, BookCover, AddToCartButton
│   ├── admin/             — AdminSidebar, BookForm
│   ├── account/           — MemberSidebar
│   └── shared/            — BrandStripeDivider, Breadcrumbs, EmptyState, etc.
├── hooks/                 — useAuth, useCart
├── lib/
│   ├── firebase/          — client, admin, firestore, auth-server
│   ├── razorpay/          — Razorpay client, signature verification
│   └── email/             — Resend email helpers
└── types/                 — Shared TypeScript types
scripts/
├── seed.ts                — Development seed data
└── provision-admin.ts     — Grant admin custom claim
```

---

## Security Checklist

- [x] Admin privileges granted only via server-side script (custom claims)
- [x] All admin routes protected server-side in layout
- [x] All member routes protected server-side in layout
- [x] Prices fetched from database on server — never trusted from client
- [x] Razorpay payment signature verified on server before fulfillment
- [x] Razorpay webhook signature verified before processing
- [x] Order fulfillment is idempotent (transaction-based)
- [x] PDF downloads require verified entitlement check on server
- [x] Download URLs are short-lived signed URLs (1 hour)
- [x] PDFs stored in private Firebase Storage (no public access)
- [x] Session cookies are httpOnly, secure in production
- [x] No credentials or secrets in client-side code
- [x] Order ownership verified on every member order request
- [x] Cross-customer access prevented on all account routes

---

## Production Launch Checklist

- [ ] All `.env.local` values set in Vercel environment variables
- [ ] Firebase project in production mode
- [ ] Firestore and Storage security rules deployed
- [ ] Admin account provisioned via script
- [ ] Razorpay KYC completed and live keys configured
- [ ] Resend domain verified and `EMAIL_FROM` set
- [ ] At least one book published and featured
- [ ] At least one category created and visible
- [ ] Store settings configured (store name, support email)
- [ ] Author bio and photo set via admin dashboard
- [ ] Legal pages reviewed (Privacy, Terms, Refund Policy, Download Policy)
- [ ] Razorpay webhook URL configured and tested
- [ ] Custom domain configured in Vercel
- [ ] HTTPS confirmed active
