'use client'

import { Button } from '@/components/ui/button'
import { FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'

interface ExcelSharesExportButtonProps {
  shares: any[]
}

export function ExcelSharesExportButton({ shares }: ExcelSharesExportButtonProps) {
  const handleExport = () => {
    try {
      if (!shares || shares.length === 0) {
        toast.error("Dışarı aktarılacak veri bulunamadı.")
        return
      }

      let csvContent = '\uFEFF' // UTF-8 BOM to prevent Turkish encoding issues in Excel
      
      // Document Headers
      csvContent += "YURTDIŞI BAĞIŞÇI VE İŞLEMLER LİSTESİ\n"
      csvContent += `Tarih:,${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}\n`
      csvContent += `Toplam Kayıt:,${shares.length}\n\n`
      
      // Table Column Headers
      csvContent += "Sıra No,Bağışçı Adı Soyadı,Telefon Numarası,Kurban Türü,Satış Fiyatı,Ödenen Tutar,Kalan Bakiye,Para Birimi,Sabit Kur,Ödeme Durumu,Referans / Grup\n"
      
      shares.forEach((share, index) => {
        const shareType = share.share_type === 'BAGIS' ? 'Yurtdışı Bağış' : share.share_type === 'HISSE_SATISI' ? 'Normal Hisse' : share.share_type
        const paymentStatus = share.payment_status === 'PAID' ? 'Ödendi' : share.payment_status === 'PARTIAL' ? 'Kısmi Ödendi' : 'Ödenmedi'
        const remaining = Math.max(0, Number(share.sale_price || 0) - Number(share.total_paid || 0))
        
        // Escape quotes to prevent CSV parsing issues
        const name = share.donor_name ? `"${share.donor_name.replace(/"/g, '""')}"` : '""'
        const phone = share.donor_phone ? `"${share.donor_phone.replace(/"/g, '""')}"` : '""'
        const refName = share.reference_name ? `"${share.reference_name.replace(/"/g, '""')}"` : '""'
        
        csvContent += `${index + 1},${name},${phone},"${shareType}",${share.sale_price || 0},${share.total_paid || 0},${remaining},"${share.currency || 'TRY'}",${share.exchange_rate || 1.0},"${paymentStatus}",${refName}\n`
      })

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `yurtdisi_bagisci_listesi_${new Date().toISOString().slice(0,10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Excel formatında bağışçı listesi başarıyla indirildi.")
    } catch (e: any) {
      toast.error("Dosya dışarı aktarılırken hata oluştu: " + e.message)
    }
  }

  return (
    <Button
      onClick={handleExport}
      className="bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md cursor-pointer gap-1.5"
    >
      <FileSpreadsheet className="w-4 h-4" />
      Excel Listesi İndir
    </Button>
  )
}
