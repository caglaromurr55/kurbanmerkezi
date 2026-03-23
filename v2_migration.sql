-- V2 Migration: Finans ve Kurban Türleri Güncellemesi

-- 1. ENUM Tipleri Oluşturma
-- Daha önce enum kullandıysanız DROP edip CREATE edebilir veya tabloya doğrudan TEXT check ekleyebilirsiniz.
-- Supabase UI tarafında daha esnek olmak adına TEXT kolonlar açıp CHECK constraint kullanacağız.

-- ANIMALS (Hayvanlar) Tablosuna Eklenecekler
ALTER TABLE public.animals 
  ADD COLUMN IF NOT EXISTS region TEXT CHECK (region IN ('YURTICI', 'YURTDISI')) DEFAULT 'YURTICI';

-- SHARES (Hisseler/Bağışlar) Tablosuna Eklenecekler
ALTER TABLE public.shares 
  ADD COLUMN IF NOT EXISTS share_type TEXT CHECK (share_type IN ('HISSE_SATISI', 'BAGIS', 'ADAK', 'AKIKA')) DEFAULT 'HISSE_SATISI',
  ADD COLUMN IF NOT EXISTS region TEXT CHECK (region IN ('YURTICI', 'YURTDISI')) DEFAULT 'YURTICI',
  ADD COLUMN IF NOT EXISTS reference_name TEXT,
  ADD COLUMN IF NOT EXISTS sale_price NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT CHECK (currency IN ('TRY', 'USD', 'EUR')) DEFAULT 'TRY',
  ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(10,4) DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('PENDING', 'PAID', 'PARTIAL')) DEFAULT 'PENDING';

-- Mevcut verileri yeni constraint'e uyması için güncelleme
UPDATE public.animals set region = 'YURTICI' WHERE region IS NULL;
UPDATE public.shares set share_type = 'HISSE_SATISI' WHERE share_type IS NULL;
UPDATE public.shares set region = 'YURTICI' WHERE region IS NULL;
UPDATE public.shares set currency = 'TRY' WHERE currency IS NULL;
UPDATE public.shares set payment_status = 'PENDING' WHERE payment_status IS NULL;
