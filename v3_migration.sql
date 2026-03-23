-- V3 Migration: Ayarlar ve Kilo Takibi

-- 1. Ayarlar (tenant_settings) Tablosu
CREATE TABLE IF NOT EXISTS public.tenant_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    fix_exchange_rate BOOLEAN DEFAULT false,
    fixed_usd_rate NUMERIC(10,4) DEFAULT 45.0000,
    default_international_price NUMERIC(10,2) DEFAULT 100.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id)
);

ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own tenant settings" 
    ON public.tenant_settings FOR ALL 
    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Her bir tenant için boş bir ayarlar satırı oluştur (Trigger ya da default olarak seed)
-- Sisteme giren dernek ilk baştan varsayılanıyla alsın:
INSERT INTO public.tenant_settings (tenant_id) 
SELECT id FROM public.tenants 
ON CONFLICT (tenant_id) DO NOTHING;


-- 2. Hayvanlar (animals) Tablosuna Kilo ve Fiyat Sütunları
ALTER TABLE public.animals 
  ADD COLUMN IF NOT EXISTS price_per_kg NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS initial_weight NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS final_weight NUMERIC(10,2) DEFAULT 0;

