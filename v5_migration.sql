-- v5_migration.sql
-- Dropdown hataları ve Yurtdışı mantığı düzenlemeleri
-- Hata: Could not find the 'default_international_sale_price_tl' column of 'tenant_settings' in the schema cache

ALTER TABLE public.tenant_settings ADD COLUMN IF NOT EXISTS default_international_sale_price_tl NUMERIC DEFAULT 0;

-- NOT: Bu sorguyu çalıştırdıktan sonra Supabase Dashboard üzerinden veya 
-- Edge Functions ile Schema Cache'i temizlediğinizi doğrulayın.
