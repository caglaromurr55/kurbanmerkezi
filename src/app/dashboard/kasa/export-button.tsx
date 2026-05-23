'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function ExportKasaButton({ transactions, campaignName }: { transactions: any[], campaignName: string }) {
  const exportToExcel = () => {
    if (!transactions || transactions.length === 0) {
      alert('Dışa aktarılacak işlem bulunamadı.')
      return
    }

    // CSV Headers
    const headers = [
      'Tarih',
      'İşlem Tipi',
      'Kategori / Bağlantı',
      'Açıklama',
      'Ödeme Yöntemi',
      'Tutar',
      'Para Birimi',
      'Döviz Kuru',
      'TL Karşılığı'
    ]

    // CSV Rows
    const rows = transactions.map((t) => {
      const date = new Date(t.created_at).toLocaleString('tr-TR')
      const type = t.type === 'INCOME' ? 'GELİR' : 'GİDER'
      const connection = t.shares ? `${t.shares.donor_name} (Hisse Tahsilatı)` : 'Manuel İşlem'
      const description = t.description || '-'
      const method = t.payment_method === 'CASH' ? 'Nakit' : t.payment_method === 'CREDIT_CARD' ? 'Kredi Kartı' : 'Havale/EFT'
      const amount = t.amount
      const currency = t.currency
      const exchangeRate = t.exchange_rate || 1
      const totalTRY = amount * exchangeRate

      return [
        `"${date}"`,
        `"${type}"`,
        `"${connection.replace(/"/g, '""')}"`,
        `"${description.replace(/"/g, '""')}"`,
        `"${method}"`,
        amount,
        `"${currency}"`,
        exchangeRate,
        totalTRY
      ]
    })

    // Combine headers and rows
    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Excel compatibility
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `kasa_defteri_${campaignName.toLowerCase().replace(/\s+/g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button
      variant="outline"
      onClick={exportToExcel}
      className="gap-2 text-slate-700 bg-white border-slate-200 hover:bg-slate-50 font-semibold shadow-sm w-full sm:w-auto cursor-pointer"
    >
      <Download className="h-4 w-4 text-slate-500" />
      Excel Olarak İndir
    </Button>
  )
}
