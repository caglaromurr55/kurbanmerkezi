import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MatchmakingBoard } from './board'

export default async function YurtdisiMatchmakingPage() {
  const supabase = await createClient()

  // 1. Auth Kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Aktif Dönem Kontrolü
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  if (!userData?.tenant_id) redirect('/dashboard')

  const { data: activeCampaign } = await supabase
    .from('campaigns')
    .select('id, name')
    .eq('tenant_id', userData.tenant_id)
    .eq('is_active', true)
    .single()

  if (!activeCampaign) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-white rounded-[24px] border shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Aktif Dönem Bulunamadı</h2>
          <p className="text-slate-500 mt-2 font-medium">Lütfen işlemlerden önce aktif bir kurban dönemi belirleyin.</p>
        </div>
      </div>
    )
  }

  // 3. Yurtdışı Kurbanlıkları Getir (İçindeki Hisselerle Birlikte)
  const { data: animals } = await supabase
    .from('animals')
    .select('*, shares(*)')
    .eq('campaign_id', activeCampaign.id)
    .eq('region', 'YURTDISI')
    .order('created_at', { ascending: true }) // Oluşturulma tarihine göre sıralı

  // 4. Bekleyen (Henüz eşleşmemiş) Yurtdışı Hisselerini Getir
  const { data: pendingShares } = await supabase
    .from('shares')
    .select('*')
    .eq('campaign_id', activeCampaign.id)
    .eq('region', 'YURTDISI')
    .is('animal_id', null)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-[1400px] w-full mx-auto">
      <MatchmakingBoard
        initialAnimals={animals || []}
        initialPendingShares={pendingShares || []}
        campaignId={activeCampaign.id}
      />
    </div>
  )
}
