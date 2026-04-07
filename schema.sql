-- ================================================================
-- سوق الخصومات (Discount Market) - Supabase Schema
-- ================================================================

-- 1. جدول التصنيفات (Categories)
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول المتاجر (Stores)
CREATE TABLE public.stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    image_url TEXT,
    article TEXT,
    category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. جدول اكواد الكوبونات (Coupons)
CREATE TABLE public.coupons (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES public.stores(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    discount VARCHAR(50),
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- إعدادات الأمان (Row Level Security - RLS)
-- ================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- السماح للزوار بقراءة البيانات فقط
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Allow public read coupons" ON public.coupons FOR SELECT USING (true);

-- السماح للإدمن بالتعديل الكامل
CREATE POLICY "Allow admin full access categories" ON public.categories FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow admin full access stores" ON public.stores FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow admin full access coupons" ON public.coupons FOR ALL USING (auth.uid() IS NOT NULL);

-- ================================================================
-- بيانات مبدئية تجريبية
-- ================================================================
INSERT INTO public.categories (name, icon) VALUES 
('الإلكترونيات', '📱'),
('الأزياء', '👗'),
('الصحة', '🌿');

INSERT INTO public.stores (name, description, icon, category_id) VALUES 
('نون', 'أفضل المنتجات بأفضل الأسعار', '🟡', 1),
('أمازون', 'تسوق إلكترونيات برايم', '📦', 1),
('أيهيرب', 'منتجات صحية أصلية', '🌿', 3);

INSERT INTO public.coupons (store_id, title, code, discount, valid_until) VALUES 
(1, 'خصم 10% على كل شيء', 'SAVE10', 'خصم 10%', '2026-12-31'),
(2, 'شحن مجاني للعملاء الجدد', 'AMZ15', 'شحن مجاني', '2026-12-31'),
(3, 'على الطلبات عبر 200 ريال', 'HERB10', 'خصم 10%', '2026-12-31');
