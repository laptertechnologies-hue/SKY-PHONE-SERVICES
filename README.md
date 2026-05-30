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

Create a table `products` with these columns:

| Column      | Type    |
|-------------|---------|
| id          | uuid (primary key, auto) |
| name        | text |
| price       | numeric |
| description | text |
| image_url   | text |
| category    | text |
| brand       | text |
| model       | text |
| condition   | text |
| stock       | integer |

## License
MIT
