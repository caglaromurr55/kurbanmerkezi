-- Kurban Merkezi V6 ve V7 Toplu Veritabanı Güncellemesi --

-- ==========================================
-- 1. ADIM: KASA (TRANSACTIONS) TABLOSUNUN OLUŞTURULMASI (V6)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    share_id UUID REFERENCES public.shares(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'TRY',
    exchange_rate NUMERIC DEFAULT 1.0,
    payment_method TEXT NOT NULL DEFAULT 'CASH' CHECK (payment_method IN ('CASH', 'CREDIT_CARD', 'BANK_TRANSFER')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Politikaları
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for transactions" ON public.transactions;
CREATE POLICY "Tenant isolation for transactions" ON public.transactions
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- ==========================================
-- 2. ADIM: HİSSE PAYMENT (ÖDEME) SÜTUNLARININ EKLENMESİ (V6)
-- ==========================================
ALTER TABLE public.shares ADD COLUMN IF NOT EXISTS total_paid NUMERIC DEFAULT 0;

-- ==========================================
-- 3. ADIM: HAYVANLAR (ANIMALS) KİLO VE STATÜ SÜTUNLARININ EKLENMESİ (V7)
-- ==========================================
ALTER TABLE public.animals ADD COLUMN IF NOT EXISTS initial_weight NUMERIC DEFAULT 0;
ALTER TABLE public.animals ADD COLUMN IF NOT EXISTS final_weight NUMERIC DEFAULT 0;
ALTER TABLE public.animals ADD COLUMN IF NOT EXISTS price_per_kg NUMERIC DEFAULT 0;
ALTER TABLE public.animals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SLAUGHTERED', 'BUTCHERED', 'COMPLETED'));

-- Schema Cache temizlemesi
NOTIFY pgrst, 'reload schema';
