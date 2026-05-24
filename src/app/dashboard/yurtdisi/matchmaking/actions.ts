'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function bulkAssignSharesToAnimal(shareIds: string[], animalId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (!shareIds || shareIds.length === 0 || !animalId) {
    throw new Error('Geçersiz parametreler')
  }

  // Check animal capacity and current usage
  const { data: animal } = await supabase.from('animals').select('share_capacity').eq('id', animalId).single()
  if (!animal) throw new Error('Hayvan bulunamadı')

  const { count: assignedCount } = await supabase.from('shares').select('*', { count: 'exact', head: true }).eq('animal_id', animalId)
  const currentUsage = assignedCount || 0

  if (currentUsage + shareIds.length > animal.share_capacity) {
    throw new Error(`Kapasite aşımı! Bu kurbanda ${animal.share_capacity - currentUsage} kişilik yer var fakat atamaya çalıştığınız grup ${shareIds.length} kişilik.`)
  }

  const { error } = await supabase
    .from('shares')
    .update({
      animal_id: animalId,
      status: 'ASSIGNED'
    })
    .in('id', shareIds)

  if (error) {
    console.error('Error in bulkAssignSharesToAnimal:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/yurtdisi/matchmaking')
  revalidatePath('/dashboard/yurtdisi')
  revalidatePath('/dashboard/animals')
}

export async function createNewMatchmakingAnimal(campaignId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()

  const newEarTag = `YD-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`

  const { error } = await supabase.from('animals').insert({
    campaign_id: campaignId,
    tenant_id: userData?.tenant_id,
    region: 'YURTDISI',
    type: 'BUYUKBAS',
    ear_tag: newEarTag,
    share_capacity: 7,
    status: 'PENDING',
    price_per_kg: 0,
    initial_weight: 0,
    final_weight: 0
  })

  if (error) {
    console.error('Error creating new matchmaking animal:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/yurtdisi/matchmaking')
}
