'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCampaign(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()

  const name = formData.get('name') as string
  const year = parseInt(formData.get('year') as string)
  
  const { error } = await supabase.from('campaigns').insert({
    tenant_id: userData?.tenant_id,
    name,
    year,
    is_active: true
  })

  if (!error) {
     await supabase.from('campaigns').update({ is_active: false }).neq('name', name).eq('tenant_id', userData?.tenant_id)
  }

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/campaigns')
}
