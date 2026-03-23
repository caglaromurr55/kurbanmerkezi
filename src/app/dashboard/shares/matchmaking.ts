'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function autoMatchShares(campaignId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: pendingShares } = await supabase.from('shares')
    .select('id, reference_name, region')
    .eq('campaign_id', campaignId)
    .eq('status', 'PENDING')
    .order('created_at', { ascending: true })

  if (!pendingShares || pendingShares.length === 0) return { success: true, count: 0 }

  const { data: animals } = await supabase.from('animals')
    .select('id, share_capacity, region')
    .eq('campaign_id', campaignId)
    .eq('status', 'PENDING')

  if (!animals || animals.length === 0) return { success: true, count: 0 }

  const { data: assignedShares } = await supabase.from('shares')
    .select('animal_id')
    .eq('campaign_id', campaignId)
    .not('animal_id', 'is', null)

  const animalUsage: Record<string, number> = {}
  animals.forEach(a => { animalUsage[a.id] = 0 })
  assignedShares?.forEach(s => {
    if (animalUsage[s.animal_id] !== undefined) {
      animalUsage[s.animal_id]++
    }
  })

  // 1. Hayvan havuzunu hazırla
  const animalPool = animals.map(a => ({
    ...a,
    available: a.share_capacity - animalUsage[a.id]
  }))

  // 2. Bekleyen hisseleri grupla (Bölge + Referans Bazlı)
  const groups: { [key: string]: any[] } = {}
  let noRefIndex = 0

  pendingShares.forEach(share => {
    if (share.reference_name && share.reference_name.trim() !== '') {
      const key = `${share.region}_REF_${share.reference_name.trim().toLowerCase()}`
      if (!groups[key]) groups[key] = []
      groups[key].push(share)
    } else {
      const key = `${share.region}_NOREF_${noRefIndex++}`
      groups[key] = [share]
    }
  })

  // Büyük grupları önce atamak mantıklıdır ki yer bulabilsinler
  // 7'den büyük olan referans gruplarını ayırmak mantıklı olabilir ama şimdilik mevcut kapasite yapısı korunuyor
  const sortedGroups = Object.values(groups).sort((a, b) => b.length - a.length)

  const updates: any[] = []
  
  // Yeni hayvan üretimi için tenant_id gerekli olabilir
  const { data: campaign } = await supabase.from('campaigns').select('tenant_id').eq('id', campaignId).single()

  for (const group of sortedGroups) {
    const reqRegion = group[0].region
    const reqSize = group.length

    // Bu gruba uygun kapasitede ve bölgede bir hayvan bul
    const validAnimal = animalPool.find(a => a.region === reqRegion && a.available >= reqSize)

    if (validAnimal) {
      group.forEach(share => {
        updates.push({
          id: share.id,
          animal_id: validAnimal.id,
          status: 'ASSIGNED'
        })
      })
      validAnimal.available -= reqSize
    }
  }

  if (updates.length > 0) {
    await Promise.all(updates.map(u => 
      supabase.from('shares').update({ animal_id: u.animal_id, status: u.status }).eq('id', u.id)
    ))
  }

  revalidatePath('/dashboard/shares')
  revalidatePath('/dashboard/animals')
  return { success: true, count: updates.length }
}
