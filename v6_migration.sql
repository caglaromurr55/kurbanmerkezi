-- Kasa, İşlem Defteri ve Otomatik Tahsilat Yapısı (V6)

-- 1. Transactions (Kasa Hareketleri) Tablosu
CREATE TABLE public.transactions (
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

-- 2. Hisseler tablosuna toplam ödenen tutar bilgisini ekle
ALTER TABLE public.shares ADD COLUMN IF NOT EXISTS total_paid NUMERIC DEFAULT 0;

-- 3. RLS (Row Level Security) - Kasa İşlemleri için
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation for transactions" ON public.transactions
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Tüm veritabanı Schema Cache'ini yenile! (Next.js server action hatalarını önlemek için son adım)
NOTIFY pgrst, 'reload schema';
