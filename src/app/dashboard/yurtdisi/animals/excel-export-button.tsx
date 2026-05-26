'use client'

import { Button } from '@/components/ui/button'
import { FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'

interface ExcelExportButtonProps {
  animals: any[]
  campaignName: string
}

export function ExcelExportButton({ animals, campaignName }: ExcelExportButtonProps) {
  const handleExport = () => {
    try {
      let csvContent = '\uFEFF' // UTF-8 BOM to prevent Turkish encoding issues in Excel
      
      csvContent += "YURTDIŞI KURBAN LİSTESİ GRUPLU RAPORU\n"
      csvContent += `Dönem:,${campaignName}\n`
      csvContent += `Tarih:,${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}\n\n`
      
      animals.forEach((animal, index) => {
        csvContent += `Kurban Sırası:,${index + 1}\n`
        csvContent += `Küpe No:,${animal.ear_tag || 'İsimsiz'}\n`
        csvContent += `Tür:,${animal.type === 'BUYUKBAS' ? 'Büyükbaş' : 'Küçükbaş'}\n`
        csvContent += `Kapasite:,${animal.shares?.length || 0} / ${animal.share_capacity || 7}\n`
        csvContent += "Hisse Sıra No,Hissedar Adı,Telefon,Referans Grubu,Ödeme Durumu\n"
        
        const shares = animal.shares || []
        for (let i = 0; i < 7; i++) {
          const share = shares[i]
          if (share) {
            const paymentStatus = share.payment_status === 'PAID' ? 'Ödendi' : share.payment_status === 'PARTIAL' ? 'Kısmi Ödendi' : 'Ödenmedi'
            csvContent += `${i + 1},"${share.donor_name || ''}","${share.donor_phone || ''}","${share.reference_name || ''}","${paymentStatus}"\n`
          } else {
            csvContent += `${i + 1},[BOŞ HİSSE],-,-\n`
          }
        }
        csvContent += "\n" // Spacer line between animals
      })

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `yurtdisi_kurban_listesi_${campaignName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Excel formatında kurban listesi başarıyla indirildi.")
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
      Excel Raporu İndir
    </Button>
  )
}
