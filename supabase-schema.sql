-- Supabase Database Schema & Seed Data for Sky Phone Services

-- Drop existing tables to ensure clean recreation with all columns
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Create Profiles Table (to manage user roles)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" ON public.profiles
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
    FOR UPDATE TO public USING (auth.uid() = id);

-- Trigger to automatically create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Create Products Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    condition TEXT DEFAULT 'New',
    stock INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products Policies: Allow public read access, but insert/update/delete only by admins
CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin to insert products" ON public.products
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Allow admin to update products" ON public.products
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Allow admin to delete products" ON public.products
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- 3. Create Orders Table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    items TEXT NOT NULL, -- Storing JSON-stringified items as TEXT
    total NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders Policies: Allow public (or anon) insert, select/update only by order owners or admins
CREATE POLICY "Allow anyone to insert orders" ON public.orders
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow admins or owners to view orders" ON public.orders
    FOR SELECT TO public USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        ) OR user_id = auth.uid()
    );

CREATE POLICY "Allow admins or owners to update orders" ON public.orders
    FOR UPDATE TO public USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        ) OR user_id = auth.uid()
    );


-- 4. Insert Seed Products
INSERT INTO public.products (name, price, description, image_url, category, brand, model, condition, stock) VALUES
(
    'iPhone 13 Pro Max OLED Screen Replacement',
    750000,
    'Genuine Super Retina XDR OLED replacement screen for iPhone 13 Pro Max. Fixes display bleeding, dead pixels, and cracked glass. Professional installation recommended.',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80',
    'Screens',
    'Apple',
    'iPhone 13 Pro Max',
    'New',
    12
),
(
    'Samsung Galaxy S21 OEM Battery Replacement',
    120000,
    'Original equipment manufacturer (OEM) replacement battery for Samsung Galaxy S21 5G. Capacity: 4000mAh. Perfect for fixing fast-draining battery issues.',
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
    'Batteries',
    'Samsung',
    'Galaxy S21',
    'New',
    25
),
(
    'Type-C Charging Port Board for Infinix Hot 10',
    45000,
    'Premium replacement charging port board with mic and full IC protection. Fast charging supported. Fixes loose connections or charging failures.',
    'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80',
    'Charging Ports',
    'Infinix',
    'Hot 10',
    'New',
    40
),
(
    'iPhone 12 Glass Back Cover - Graphite',
    95000,
    'Replacement glass back panel for iPhone 12 in space-saving Graphite color. Exact fit with camera lens cutouts pre-aligned.',
    'https://images.unsplash.com/photo-1573148195900-7845dcb9b127?auto=format&fit=crop&w=600&q=80',
    'Back Covers',
    'Apple',
    'iPhone 12',
    'New',
    15
),
(
    'Tecno Camon 17 Pro Dual Rear Camera Module',
    180000,
    'Complete dual main rear camera module sensor replacement. Fixes camera blur, focusing issues, and cracked external lenses.',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    'Cameras',
    'Tecno',
    'Camon 17 Pro',
    'New',
    8
),
(
    'Redmi Note 10 Pro Loudspeaker Assembly',
    35000,
    'Replacement bottom buzzer ringer loudspeaker module. Resolves low sound quality, crackling noise, or completely dead speaker sound.',
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80',
    'Speakers',
    'Xiaomi',
    'Redmi Note 10 Pro',
    'New',
    30
),
(
    'Samsung Galaxy A52 Motherboard - 128GB (Unlocked)',
    350000,
    'Fully tested and unlocked OEM main board replacement for Samsung Galaxy A52 (4G variant). Memory: 128GB storage, 6GB RAM.',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    'Motherboards',
    'Samsung',
    'Galaxy A52',
    'Refurbished',
    5
),
(
    'Professional Phone Opening & Repair Tool Kit',
    60000,
    'Universal 18-piece screwdriver and suction cup tool kit for safely prying open and disassembling modern iPhones, Samsungs, Tecnos, and Infinix phones.',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    'Tools',
    'Generic',
    'Universal',
    'New',
    50
);
