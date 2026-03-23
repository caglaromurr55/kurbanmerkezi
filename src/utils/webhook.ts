import { createClient } from '@/utils/supabase/server'

export async function triggerN8nWebhook(event: string, animalId: string) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) {
    console.warn("N8N_WEBHOOK_URL eksik. Bildirim gönderilmedi.")
    return
  }

  const supabase = await createClient()

  const { data: animal } = await supabase.from('animals').select('*').eq('id', animalId).single()
  if (!animal) return

  const { data: shares } = await supabase.from('shares').select('*').eq('animal_id', animalId)

  const payload = {
    event,
    animal,
    shares: shares || []
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    console.log(`Webhook tetiklendi: ${event}, Durum: ${res.status}`)
  } catch (err) {
    console.error("Webhook hatası:", err)
  }
}
