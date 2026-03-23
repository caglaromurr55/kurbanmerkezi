'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendCustomMessage(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const message = formData.get('message') as string
  const campaign_id = formData.get('campaign_id') as string

  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (webhookUrl) {
      const payload = {
          event: 'CUSTOM_MESSAGE',
          campaign_id,
          message
      }
      try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
      } catch (err) {
          console.error("Webhook error:", err)
      }
  }

  revalidatePath('/dashboard/messages')
}
