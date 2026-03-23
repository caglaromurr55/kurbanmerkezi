'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateYurtdisiSettingsAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  const { data: existing } = await supabase.from('tenant_settings').select('*').eq('tenant_id', userData?.tenant_id).single()

  const default_international_price = parseFloat(formData.get('default_international_price') as string || '0')
  const default_international_sale_price_tl = parseFloat(formData.get('default_international_sale_price_tl') as string || '0')

  const { error } = await supabase.from('tenant_settings').upsert({
    ...(existing || {}),
    tenant_id: userData?.tenant_id,
    default_international_price,
    default_international_sale_price_tl,
    updated_at: new Date().toISOString()
  }, { onConflict: 'tenant_id' })

  if (error) {
    console.error("Yurtdisi ayar hatası:", error)
    throw new Error(error.message)
  }
  
  revalidatePath('/dashboard/yurtdisi')
  revalidatePath('/dashboard/shares')
}
