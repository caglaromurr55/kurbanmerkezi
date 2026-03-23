'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { triggerN8nWebhook } from '@/utils/webhook'

export async function updateAnimalStatus(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const animal_id = formData.get('animal_id') as string
  const status = formData.get('status') as string

  const { error } = await supabase.from('animals')
    .update({ status })
    .eq('id', animal_id)

  if (error) {
    console.error('Error updating animal status:', error)
    throw new Error(error.message)
  }

  await triggerN8nWebhook('ANIMAL_STATUS_CHANGED', animal_id)
  revalidatePath('/dashboard/operations')
}

export async function saveVideoUrl(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const animal_id = formData.get('animal_id') as string
  const video_url = formData.get('video_url') as string

  const { error } = await supabase.from('animals')
    .update({ video_url })
    .eq('id', animal_id)

  if (error) throw new Error(error.message)

  await triggerN8nWebhook('VIDEO_UPLOADED', animal_id)
  revalidatePath('/dashboard/operations')
}
