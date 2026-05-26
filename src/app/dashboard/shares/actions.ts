'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createShare(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()

  const donor_name = formData.get('donor_name') as string
  const donor_phone = formData.get('donor_phone') as string || ''
  const campaign_id = formData.get('campaign_id') as string
  const animal_id = formData.get('animal_id') as string
  
  const share_type = formData.get('share_type') as string || 'HISSE_SATISI'
  const region = formData.get('region') as string || 'YURTICI'
  const reference_name = formData.get('reference_name') as string || null
  const currency = formData.get('currency') as string || 'TRY'
  const sale_price = parseFloat(formData.get('sale_price') as string || '0')
  const exchange_rate = parseFloat(formData.get('exchange_rate') as string || '1')
  
  const initial_payment = parseFloat(formData.get('initial_payment') as string || '0')
  const payment_method = formData.get('payment_method') as string || 'CASH'
  
  let payment_status = 'PENDING'
  if (initial_payment > 0) payment_status = 'PARTIAL'
  if (initial_payment >= sale_price - 0.01 && sale_price > 0) payment_status = 'PAID'
  
  const payload: any = {
    tenant_id: userData?.tenant_id,
    campaign_id,
    donor_name,
    donor_phone,
    share_type,
    region,
    reference_name,
    currency,
    payment_status,
    sale_price,
    exchange_rate,
    total_paid: initial_payment,
    status: 'PENDING'
  }
  
  if (animal_id && animal_id !== 'none') {
      payload.animal_id = animal_id
      payload.status = 'ASSIGNED'
  }

  const { data: insertedShare, error } = await supabase.from('shares').insert(payload).select().single()

  if (error) {
    console.error('Error inserting share:', error)
    throw new Error(error.message)
  }

  if (initial_payment > 0 && insertedShare) {
      await supabase.from('transactions').insert({
          tenant_id: userData?.tenant_id,
          campaign_id,
          share_id: insertedShare.id,
          type: 'INCOME',
          amount: initial_payment,
          currency: currency,
          payment_method: payment_method,
          description: `${donor_name} - Peşinat Tahsilatı`,
          exchange_rate: exchange_rate
      })
  }

  // Yurtdışı için otomatik hayvan üretim mantığı
  if (region === 'YURTDISI' && payload.status === 'PENDING') {
      // 1. Toplam kapasite hesapla
      const { data: allAnimals } = await supabase.from('animals').select('id, share_capacity').eq('campaign_id', campaign_id).eq('region', 'YURTDISI')
      const totalCapacity = allAnimals?.reduce((acc, a) => acc + (a.share_capacity || 7), 0) || 0
      
      // 2. Toplam hisse hesapla
      const { count: totalShares } = await supabase.from('shares').select('*', { count: 'exact', head: true }).eq('campaign_id', campaign_id).eq('region', 'YURTDISI')
      const sharesCount = totalShares || 1

      // 3. Eğer kapasite aşıldıysa YENİ HAYVAN OLUŞTUR
      if (sharesCount > totalCapacity) {
         const newEarTag = `YD-${Date.now().toString().slice(-4)}${Math.floor(Math.random()*100)}`
         await supabase.from('animals').insert({
             campaign_id,
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
      }
  }

  revalidatePath('/dashboard/shares')
  revalidatePath('/dashboard/animals')
}

export async function updateShare(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const donor_name = formData.get('donor_name') as string
  const donor_phone = formData.get('donor_phone') as string || ''
  const share_type = formData.get('share_type') as string
  const region = formData.get('region') as string
  const reference_name = formData.get('reference_name') as string || null
  const currency = formData.get('currency') as string
  const payment_status = formData.get('payment_status') as string
  const sale_price = parseFloat(formData.get('sale_price') as string || '0')
  const exchange_rate = parseFloat(formData.get('exchange_rate') as string || '1')

  const { data: oldShare } = await supabase.from('shares').select('currency').eq('id', id).single()

  const { error } = await supabase.from('shares').update({
    donor_name,
    donor_phone,
    share_type,
    region,
    reference_name,
    currency,
    payment_status,
    sale_price,
    exchange_rate
  }).eq('id', id)

  if (error) throw new Error(error.message)

  if (oldShare && oldShare.currency !== currency) {
      // Update existing transactions to match the new currency and exchange rate
      await supabase.from('transactions').update({ currency, exchange_rate }).eq('share_id', id)
  }

  revalidatePath('/dashboard/shares')
  revalidatePath('/dashboard/animals')
}

export async function deleteShare(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('shares').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/shares')
  revalidatePath('/dashboard/animals')
}

export async function addPayment(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const share_id = formData.get('share_id') as string
  const amountStr = formData.get('amount') as string
  const amount = amountStr ? parseFloat(amountStr) : 0
  const currency = formData.get('currency') as string || 'TRY'
  const payment_method = formData.get('payment_method') as string || 'CASH'
  const description = formData.get('description') as string
  const exchange_rate = parseFloat(formData.get('exchange_rate') as string || '1')

  if (amount <= 0) throw new Error('Geçerli bir tutar giriniz.')

  // Fetch share details
  const { data: share } = await supabase.from('shares').select('tenant_id, campaign_id, sale_price, exchange_rate, currency').eq('id', share_id).single()
  if (!share) throw new Error('Hisse bulunamadı')

  // Insert into transactions
  const { error: txError } = await supabase.from('transactions').insert({
    tenant_id: share.tenant_id,
    campaign_id: share.campaign_id,
    share_id,
    type: 'INCOME',
    amount,
    currency,
    payment_method,
    description,
    exchange_rate
  })
  
  if (txError) throw new Error(txError.message)

  // Fetch all INCOME transactions for this share to recalculate total_paid
  const { data: txs } = await supabase.from('transactions').select('amount, exchange_rate, currency').eq('share_id', share_id).eq('type', 'INCOME')
  
  let total_paid = 0
  txs?.forEach(tx => {
     if (tx.currency === share.currency) {
         total_paid += tx.amount
     } else {
         // Convert transaction to TRY, then back to the share's currency
         const tx_try = tx.amount * (tx.exchange_rate || 1)
         const tx_in_share_currency = tx_try / (share.exchange_rate || 1)
         total_paid += tx_in_share_currency
     }
  })

  // Determine new status
  let new_status = 'PENDING'
  if (total_paid > 0) new_status = 'PARTIAL'
  // Account for slight floating point diffs
  if (total_paid >= share.sale_price - 0.01) new_status = 'PAID'

  await supabase.from('shares').update({
     total_paid,
     payment_status: new_status
  }).eq('id', share_id)

  revalidatePath('/dashboard/shares')
  revalidatePath('/dashboard/kasa')
  revalidatePath('/dashboard/yurtdisi')
}

export async function assignShareToAnimal(formData: FormData) {
  const supabase = await createClient()

  const share_id = formData.get('share_id') as string
  const animal_id = formData.get('animal_id') as string

  if (!share_id || !animal_id) throw new Error('Hisse veya hayvan seçilmedi')

  const { error } = await supabase.from('shares').update({
    animal_id,
    status: 'ASSIGNED'
  }).eq('id', share_id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/shares')
  revalidatePath('/dashboard/animals')
  revalidatePath('/dashboard/yurtdisi/animals')
}

export async function unassignShareFromAnimal(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('shares').update({
    animal_id: null,
    status: 'PENDING'
  }).eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/shares')
  revalidatePath('/dashboard/animals')
  revalidatePath('/dashboard/yurtdisi/animals')
}

export async function createSharesBatch(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()

  const donorNamesRaw = formData.get('donor_names_raw') as string || ''
  const donor_phone = formData.get('donor_phone') as string || ''
  const campaign_id = formData.get('campaign_id') as string
  
  const share_type = formData.get('share_type') as string || 'HISSE_SATISI'
  const region = formData.get('region') as string || 'YURTICI'
  const reference_name = formData.get('reference_name') as string || null
  const currency = formData.get('currency') as string || 'TRY'
  const sale_price = parseFloat(formData.get('sale_price') as string || '0')
  const exchange_rate = parseFloat(formData.get('exchange_rate') as string || '1')
  
  const initial_payment = parseFloat(formData.get('initial_payment') as string || '0')
  const payment_method = formData.get('payment_method') as string || 'CASH'

  // Parse names: split by newline, trim and filter empty ones
  const donorNames = donorNamesRaw.split('\n').map(n => n.trim()).filter(n => n.length > 0)
  if (donorNames.length === 0) throw new Error('En az bir bağışçı ismi girilmelidir.')

  let payment_status = 'PENDING'
  if (initial_payment > 0) payment_status = 'PARTIAL'
  if (initial_payment >= sale_price - 0.01 && sale_price > 0) payment_status = 'PAID'

  // Build payloads for batch insert
  const sharesPayload = donorNames.map(name => ({
    tenant_id: userData?.tenant_id,
    campaign_id,
    donor_name: name,
    donor_phone,
    share_type,
    region,
    reference_name,
    currency,
    payment_status,
    sale_price,
    exchange_rate,
    total_paid: initial_payment,
    status: 'PENDING'
  }))

  // Insert shares in a batch!
  const { data: insertedShares, error } = await supabase.from('shares').insert(sharesPayload).select()

  if (error) {
    console.error('Error batch inserting shares:', error)
    throw new Error(error.message)
  }

  // Create transactions in batch if there's any initial payment!
  if (initial_payment > 0 && insertedShares && insertedShares.length > 0) {
      const txsPayload = insertedShares.map(share => ({
          tenant_id: userData?.tenant_id,
          campaign_id,
          share_id: share.id,
          type: 'INCOME',
          amount: initial_payment,
          currency: currency,
          payment_method: payment_method,
          description: `${share.donor_name} - Toplu Peşinat Tahsilatı`,
          exchange_rate: exchange_rate
      }))
      await supabase.from('transactions').insert(txsPayload)
  }

  // Yurtdışı için otomatik hayvan üretim mantığı
  if (region === 'YURTDISI') {
      // 1. Toplam kapasite hesapla
      const { data: allAnimals } = await supabase.from('animals').select('id, share_capacity').eq('campaign_id', campaign_id).eq('region', 'YURTDISI')
      const totalCapacity = allAnimals?.reduce((acc, a) => acc + (a.share_capacity || 7), 0) || 0
      
      // 2. Toplam hisse hesapla
      const { count: totalShares } = await supabase.from('shares').select('*', { count: 'exact', head: true }).eq('campaign_id', campaign_id).eq('region', 'YURTDISI')
      const sharesCount = totalShares || 0

      // 3. Eğer kapasite aşıldıysa YENİ HAYVAN(LAR) OLUŞTUR
      if (sharesCount > totalCapacity) {
         const capacityNeeded = sharesCount - totalCapacity
         const newAnimalsCount = Math.ceil(capacityNeeded / 7)
         
         const newAnimalsPayload = []
         for (let i = 0; i < newAnimalsCount; i++) {
            const newEarTag = `YD-${Date.now().toString().slice(-4)}${Math.floor(Math.random()*100)}`
            newAnimalsPayload.push({
                campaign_id,
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
         }
         await supabase.from('animals').insert(newAnimalsPayload)
      }
  }

  revalidatePath('/dashboard/shares')
  revalidatePath('/dashboard/animals')
  revalidatePath('/dashboard/yurtdisi')
}

