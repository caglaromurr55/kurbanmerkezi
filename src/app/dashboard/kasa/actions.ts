'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()

  const campaign_id = formData.get('campaign_id') as string
  const type = formData.get('type') as string // 'INCOME' or 'EXPENSE'
  const amount = parseFloat(formData.get('amount') as string)
  const currency = formData.get('currency') as string || 'TRY'
  const payment_method = formData.get('payment_method') as string || 'CASH'
  const description = formData.get('description') as string
  const exchange_rate = parseFloat(formData.get('exchange_rate') as string || '1')

  const { error } = await supabase.from('transactions').insert({
    tenant_id: userData?.tenant_id,
    campaign_id,
    type,
    amount,
    currency,
    payment_method,
    description,
    exchange_rate
  })

  if (error) {
    console.error('Error inserting transaction:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/kasa')
}

export async function deleteTransaction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/kasa')
}
