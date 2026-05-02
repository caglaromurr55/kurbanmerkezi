'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function ExportExcelButton({ data, filename = 'liste.csv' }: { data: any[], filename?: string }) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert('Dışa aktarılacak veri bulunamadı.');
      return;
    }

    // Tablo başlıklarını alalım (ilk öğenin anahtarları veya custom başlık)
    const headers = ['Bağışçı Adı', 'Telefon', 'Bağış Tipi/Kurban', 'Para Birimi', 'Satış Tutarı', 'Ödenen', 'Ödeme Durumu', 'Bölge', 'Referans', 'Tarih'];
    
    // Verileri CSV formatına dönüştürelim
    const csvContent = [
      headers.join(';'), // Başlık satırı
      ...data.map(item => {
        return [
          `"${(item.donor_name || '').replace(/"/g, '""')}"`,
          `"${(item.donor_phone || '').replace(/"/g, '""')}"`,
          `"${(item.share_type || '').replace(/"/g, '""')}"`,
          `"${(item.currency || '').replace(/"/g, '""')}"`,
          item.sale_price || 0,
          item.total_paid || 0,
          `"${(item.payment_status === 'PAID' ? 'ÖDENDİ' : item.payment_status === 'PARTIAL' ? 'KISMİ ÖDENDİ' : 'ÖDENMEDİ')}"`,
          `"${(item.region || '').replace(/"/g, '""')}"`,
          `"${(item.reference_name || '').replace(/"/g, '""')}"`,
          `"${new Date(item.created_at).toLocaleDateString('tr-TR')}"`
        ].join(';'); // Sütunları ; ile ayıralım (Türkçe Excel için ; daha iyi çalışır)
      })
    ].join('\n'); // Satırları yeni satır karakteri ile ayıralım

    // CSV verisini Blob'a dönüştürüp indirelim
    // Türkçe karakterlerin düzgün görünmesi için BOM (\uFEFF) ekliyoruz.
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 shadow-sm font-semibold" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" /> Excel Olarak İndir
    </Button>
  )
}
