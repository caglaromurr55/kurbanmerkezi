'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAnimal(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()

  const type = formData.get('type') as string
  const ear_tag = formData.get('ear_tag') as string
  const weight_group = formData.get('weight_group') as string
  const share_capacity = parseInt(formData.get('share_capacity') as string)
  const campaign_id = formData.get('campaign_id') as string
  const region = formData.get('region') as string || 'YURTICI'

  const price_per_kg = parseFloat(formData.get('price_per_kg') as string || '0')
  const initial_weight = parseFloat(formData.get('initial_weight') as string || '0')
  const final_weight = parseFloat(formData.get('final_weight') as string || '0')

  const { error } = await supabase.from('animals').insert({
    tenant_id: userData?.tenant_id,
    campaign_id,
    type,
    ear_tag,
    weight_group,
    share_capacity,
    region,
    price_per_kg,
    initial_weight,
    final_weight,
    status: 'PENDING'
  })

  if (error) {
    console.error('Error inserting animal:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/animals')
}

export async function updateAnimalVideo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const id = formData.get('id') as string
  const video_url = formData.get('video_url') as string

  const { error } = await supabase.from('animals').update({
    video_url
  }).eq('id', id)

  if (error) {
    console.error('Error updates video:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/animals')
}

export async function updateAnimal(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const region = formData.get('region') as string

  // Define what fields can be updated
  const payload: any = {
    type: formData.get('type') as string,
    share_capacity: parseInt(formData.get('share_capacity') as string),
    weight_group: formData.get('weight_group') as string,
    status: formData.get('status') as string,
  }

  if (region !== 'YURTDISI') {
    payload.ear_tag = formData.get('ear_tag') as string
    
    // Yurtici ozel kilo/fiyat alanlari
    const initial_weight_str = formData.get('initial_weight') as string
    if (initial_weight_str) payload.initial_weight = parseFloat(initial_weight_str)

    const final_weight_str = formData.get('final_weight') as string
    if (final_weight_str) payload.final_weight = parseFloat(final_weight_str)

    const price_per_kg_str = formData.get('price_per_kg') as string
    if (price_per_kg_str) payload.price_per_kg = parseFloat(price_per_kg_str)
  }

  const { error } = await supabase.from('animals').update(payload).eq('id', id)

  if (error) {
    console.error('Error updating animal:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/animals')
  revalidatePath('/dashboard/yurtici')
  revalidatePath('/dashboard/yurtdisi')
}

export async function deleteAnimal(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string

  // Önce bağlı hisselerin animal_id'sini null yap (Boşa çıkar)
  const { error: shareError } = await supabase.from('shares').update({ animal_id: null }).eq('animal_id', id)
  if (shareError) {
    throw new Error(shareError.message)
  }

  const { error } = await supabase.from('animals').delete().eq('id', id)

  if (error) {
    throw new Error("Veritabanı Hatası: " + error.message)
  }
  
  // Acaba silindi mi kontrol edelim
  const { data: checkData } = await supabase.from('animals').select('id').eq('id', id).single()
  
  if (checkData) {
      throw new Error("Hata: Hayvan silinemedi! Supabase tarafında Delete (Silme) RLS kuralları kapalı veya hatalı yapılandırılmış. Lütfen Supabase Panelinden 'animals' tablosunun RLS Delete politikasını kontrol edin.")
  }

  revalidatePath('/dashboard/animals')
  revalidatePath('/dashboard/yurtici')
  revalidatePath('/dashboard/yurtdisi')
}
