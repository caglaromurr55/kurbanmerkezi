-- SUPABASE SQL EDITOR'DA ÇALIŞTIRIN --

-- 1. Yetki Kontrolü İçin Yardımcı Fonksiyon (Sonsuz Döngü / Infinite Loop Çözümü)
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid();
$$;

-- 2. Eski Hatalı Politikaları Sil
DROP POLICY IF EXISTS "Tenants viewable by own users" ON public.tenants;
DROP POLICY IF EXISTS "Users viewable by tenant members" ON public.users;
DROP POLICY IF EXISTS "Tenant isolation for campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Tenant isolation for animals" ON public.animals;
DROP POLICY IF EXISTS "Tenant isolation for shares" ON public.shares;

-- 3. Yeni, Güvenli ve Performanslı RLS Politikalarını Ekle

-- Tenants
CREATE POLICY "Tenants viewable by own users" ON public.tenants
  FOR SELECT USING (id = public.get_auth_tenant_id());

-- Users
CREATE POLICY "Users viewable by tenant members" ON public.users
  FOR SELECT USING (tenant_id = public.get_auth_tenant_id());

-- Campaigns
CREATE POLICY "Tenant isolation for campaigns" ON public.campaigns
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- Animals
CREATE POLICY "Tenant isolation for animals" ON public.animals
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- Shares
CREATE POLICY "Tenant isolation for shares" ON public.shares
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());
