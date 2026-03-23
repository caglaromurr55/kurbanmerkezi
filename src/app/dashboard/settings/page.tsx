import { createClient } from '@/utils/supabase/server'
import { SettingsForm } from './settings-form'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  const { data: settings } = await supabase.from('tenant_settings').select('*').eq('tenant_id', userData?.tenant_id).single()

  let liveUsdRate = 35.0
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { next: { revalidate: 3600 } })
    const data = await res.json()
    liveUsdRate = data.rates.TRY
  } catch (e) {
    console.error("Döviz kuru alınamadı")
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in py-2">
      <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Sistem Ayarları</h1>
          <p className="text-slate-500 font-medium">Finansal yapılandırmalarınızı ve güvenlik seçeneklerinizi yönetin.</p>
      </div>

      <SettingsForm settings={settings} liveUsdRate={liveUsdRate} />
    </div>
  )
}
