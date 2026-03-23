-- Kurban Operasyon Yönetim Sistemi - Supabase Şeması ve RLS

-- ==========================================
-- 1. TABLOLARIN OLUŞTURULMASI
-- ==========================================

-- 1. Tenants (Dernekler)
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users (Kullanıcılar)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'TENANT_ADMIN', 'STAFF')),
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Campaigns (Dönemler)
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Animals (Kurbanlıklar)
CREATE TABLE public.animals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('BUYUKBAS', 'KUCUKBAS')),
    weight_group TEXT,
    ear_tag TEXT,
    share_capacity INTEGER NOT NULL DEFAULT 7,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'SLAUGHTERING', 'COMPLETED', 'PROCESSING')),
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Shares (Hisseler/Bağışçılar)
CREATE TABLE public.shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
    donor_name TEXT NOT NULL,
    donor_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. RLS (ROW LEVEL SECURITY) POLİTİKALARI
-- ==========================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants viewable by own users" ON public.tenants
  FOR SELECT USING (
    id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users viewable by tenant members" ON public.users
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation for campaigns" ON public.campaigns
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation for animals" ON public.animals
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation for shares" ON public.shares
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid()));
