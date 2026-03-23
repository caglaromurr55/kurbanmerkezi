'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSettingsAction(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()

  const fix_exchange_rate = formData.get('fix_exchange_rate') === 'on'
  const fixed_usd_rate = parseFloat(formData.get('fixed_usd_rate') as string || '35')
  const default_international_price = parseFloat(formData.get('default_international_price') as string || '100')

  const { error } = await supabase.from('tenant_settings').upsert({
    tenant_id: userData?.tenant_id,
    fix_exchange_rate,
    fixed_usd_rate,
    default_international_price,
    updated_at: new Date().toISOString()
  }, { onConflict: 'tenant_id' })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/shares')
}

export async function updatePasswordAction(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string
  
  if (password !== confirmPassword) throw new Error('Şifreler uyuşmuyor.')
  if (password.length < 6) throw new Error('Şifre en az 6 karakter olmalıdır.')

  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(error.message)
}
