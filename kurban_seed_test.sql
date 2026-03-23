-- SUPABASE SQL EDITOR'DA ÇALIŞTIRIN --
-- Lütfen kendi Supabase projenizde Authentication kısmından bir kullanıcı oluşturup, UUID'sini aşağıya yapıştırın.

DO $$
DECLARE
  v_tenant_id uuid;
  v_campaign_id uuid;
  v_user_id uuid := '70d6f15d-4764-48ba-9588-df2da3616ecc'; -- LÜTFEN DEĞİŞTİRİN
BEGIN
  -- Eğer ID geçerliyse çalışır, geçerli değilse hata verir.
  -- Yeni bir dernek oluştur
  INSERT INTO public.tenants (name) VALUES ('Test Dernek') RETURNING id INTO v_tenant_id;
  
  -- Kullanıcıyı derneğe bağla
  INSERT INTO public.users (id, tenant_id, role, full_name) 
  VALUES (v_user_id, v_tenant_id, 'TENANT_ADMIN', 'Dernek Yönetimi');

  -- Örnek bir kampanya oluştur
  INSERT INTO public.campaigns (tenant_id, year, name, is_active)
  VALUES (v_tenant_id, 2026, '2026 Kurban Organizasyonu', true)
  RETURNING id INTO v_campaign_id;

  -- Örnek Hayvanlar
  INSERT INTO public.animals (tenant_id, campaign_id, type, weight_group, ear_tag, share_capacity, status)
  VALUES 
  (v_tenant_id, v_campaign_id, 'BUYUKBAS', '200-250 KG', 'TR-12345', 7, 'PENDING'),
  (v_tenant_id, v_campaign_id, 'KUCUKBAS', '30-40 KG', 'TR-98765', 1, 'SLAUGHTERING');

  -- Örnek Hisseler
  INSERT INTO public.shares (tenant_id, campaign_id, donor_name, donor_phone, status)
  VALUES
  (v_tenant_id, v_campaign_id, 'Ahmet Yılmaz', '+905551234567', 'PENDING'),
  (v_tenant_id, v_campaign_id, 'Ayşe Demir', '+905559876543', 'PENDING');

END $$;
