# Sky Phone Services – E‑Commerce Store

A premium, mobile‑first React + TypeScript storefront for selling phone spare parts in Uganda.

## Features
- Responsive UI with modern glass‑morphism and Outfit font
- Supabase auth (email/password + Google) and data storage
- Product catalog, cart, and checkout flow
- MazPay mobile‑money payment integration
- Easy deployment (Vite, Netlify/Vercel ready)

## Getting Started

```bash
# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Then fill in your credentials

# Run dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Deploy
```bash
npm run build
# Deploy the dist/ folder to Netlify, Vercel, Cloudflare Pages, etc.
```

## Environment Variables (.env – never commit this)

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_MAZPAY_API_KEY=your-mazpay-api-key
VITE_MAZPAY_AUTH_HEADER=your-base64-auth-header
```

## Database Setup (Supabase)

We have provided a complete initialization script containing the database table schemas, Row-Level Security (RLS) policies, and pre-populated seed data:

1. Log into your [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor** from the left-hand menu.
3. Click **New Query**.
4. Open the [supabase-schema.sql](file:///C:/Users/LAPTER/.gemini/antigravity/scratch/sky-phone-ecommerce/supabase-schema.sql) file at the root of the project.
5. Copy and paste the entire script into the query editor, then click **Run**.

This script will set up the `products` and `orders` tables, enable Row Level Security, and seed the store with realistic phone spare parts categories and items ready for purchase.

## License
MIT
