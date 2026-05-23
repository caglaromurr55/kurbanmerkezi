'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, User, Phone, Tags, Link2, Wallet, DollarSign, ArrowRightLeft, Trash2, Undo } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateShare, deleteShare, unassignShareFromAnimal } from '../shares/actions'

export function EditShareDialog({ share }: { share: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const SHARE_TYPE_MAP: Record<string, string> = { HISSE_SATISI: 'Normal Hisse', BAGIS: 'Bağış Kurban', ADAK: 'Adak', AKIKA: 'Akika', DIGER: 'Diğer (Belirtiniz)' }
  const REGION_MAP: Record<string, string> = { YURTICI: 'Yurtiçi', YURTDISI: 'Yurtdışı' }
  const CURRENCY_MAP: Record<string, string> = { TRY: 'Türk Lirası (₺)', USD: 'Dolar ($)', EUR: 'Euro (€)' }
  const PAYMENT_MAP: Record<string, string> = { PAID: 'Tamamı Ödendi', PARTIAL: 'Kısmi Ödendi (Avans)', PENDING: 'Ödenmedi / Bekliyor' }

  const isCustom = !['HISSE_SATISI', 'BAGIS', 'ADAK', 'AKIKA'].includes(share.share_type || 'HISSE_SATISI') && share.share_type;
  const [shareType, setShareType] = useState(isCustom ? 'DIGER' : (share.share_type || 'HISSE_SATISI'))
  const [customShareType, setCustomShareType] = useState(isCustom ? share.share_type : '')
  const [region, setRegion] = useState(share.region || 'YURTICI')
  const [currency, setCurrency] = useState(share.currency || 'TRY')
  const [paymentStatus, setPaymentStatus] = useState(share.payment_status || 'PENDING')

  async function onSubmit(formData: FormData) {
    setLoading(true)
    formData.append('id', share.id)
    if (shareType === 'DIGER') {
        formData.set('share_type', customShareType || 'DİĞER')
    }
    await updateShare(formData)
    setLoading(false)
    setOpen(false)
  }

  async function onDelete() {
      if (!confirm('Bu hissedarı silmek istediğinize emin misiniz?')) return;
      
      setLoading(true)
      const data = new FormData()
      data.append('id', share.id)
      await deleteShare(data)
      setLoading(false)
      setOpen(false)
  }

  async function onUnassign() {
      if (!confirm('Bu hissedarı hayvandan çıkarıp havuza geri almak istediğinize emin misiniz?')) return;

      setLoading(true)
      const data = new FormData()
      data.append('id', share.id)
      await unassignShareFromAnimal(data)
      setLoading(false)
      setOpen(false)
  }

  const isForeign = currency !== 'TRY'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button type="button" className="text-[10px] font-bold text-primary cursor-pointer hover:underline px-2 py-1 bg-transparent border-0 p-0" />}>
        Düzenle
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Bağışçı Düzenle</DialogTitle>
          <DialogDescription>
            <strong>{share.donor_name}</strong> isimli kişinin kayıt detaylarını güncelleyin.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="flex-1 overflow-y-auto px-1">
          <div className="grid gap-6 py-4">
              
              {/* Bölüm 1: Kişisel Bilgiler */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-slate-800">Kişisel Bilgiler</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="donor_name" className="text-slate-600">Bağışçı Adı Soyadı</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input id="donor_name" name="donor_name" defaultValue={share.donor_name} className="pl-9 bg-slate-50/50" required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="donor_phone" className="text-slate-600">Telefon Numarası</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input id="donor_phone" name="donor_phone" defaultValue={share.donor_phone} className="pl-9 bg-slate-50/50" required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bölüm 2: Kurban ve Eşleşme Bilgileri */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Tags className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-800">Kurban & Eşleşme</h3>
                </div>
                
                <input type="hidden" name="region" value={region} />
                <div className="grid gap-2">
                  <Label htmlFor="share_type" className="text-slate-600">Kurban Türü</Label>
                  <Select name="share_type" value={shareType} onValueChange={(val: string) => setShareType(val || '')} required>
                    <SelectTrigger className="bg-slate-50/50">
                      <span className="truncate">{shareType ? SHARE_TYPE_MAP[shareType] : 'Tür seçiniz'}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {region !== 'YURTDISI' && <SelectItem value="HISSE_SATISI">Normal Hisse</SelectItem>}
                      <SelectItem value="BAGIS">Bağış Kurban</SelectItem>
                      <SelectItem value="ADAK">Adak</SelectItem>
                      <SelectItem value="AKIKA">Akika</SelectItem>
                      <SelectItem value="DIGER">Diğer (Belirtiniz)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {shareType === 'DIGER' && (
                  <div className="grid gap-2 p-3 bg-orange-50 rounded-md border border-orange-100">
                    <Label htmlFor="custom_share_type" className="text-orange-800">Kurban Türü Belirtiniz</Label>
                    <Input id="custom_share_type" value={customShareType} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomShareType(e.target.value)} placeholder="Örn: Şükür Kurbanı" className="bg-white border-orange-200 focus-visible:ring-orange-300" required />
                  </div>
                )}

                <div className="grid gap-2 p-3 bg-blue-50/40 rounded-md border border-blue-100 border-dashed">
                  <div className="flex items-center gap-2 mb-1">
                    <Link2 className="w-4 h-4 text-blue-500" />
                    <Label htmlFor="reference_name" className="text-blue-800 font-medium whitespace-nowrap">Referans Grubu (Opsiyonel)</Label>
                    <span className="text-[10px] text-blue-500/80 hidden sm:inline-block leading-none truncate mt-0.5">
                      Aynı referansı yazdığınız kişiler aynı hayvanda gruplanır.
                    </span>
                  </div>
                  <Input id="reference_name" name="reference_name" defaultValue={share.reference_name || ''} placeholder="Örn: Ahmet Hoca Cemaati" className="bg-white border-blue-200 focus-visible:ring-blue-300" />
                </div>
              </div>

              {/* Bölüm 3: Finansal Detaylar */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Wallet className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-slate-800">Finansal Tahsilat</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currency" className="text-slate-600">Para Birimi</Label>
                    <Select name="currency" value={currency} onValueChange={(val: string) => setCurrency(val || '')} required>
                      <SelectTrigger className="bg-slate-50/50">
                        <span className="truncate">{currency ? CURRENCY_MAP[currency] : 'Döviz'}</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRY">Türk Lirası (₺)</SelectItem>
                        <SelectItem value="USD">Dolar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {isForeign ? (
                      <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="exchange_rate" className="text-slate-600">Anlık Kur (1 {currency} = ? TL)</Label>
                        <div className="relative">
                          <ArrowRightLeft className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input id="exchange_rate" name="exchange_rate" type="number" step="0.0001" defaultValue={share.exchange_rate} className="pl-9 bg-slate-50/50" required />
                        </div>
                      </div>
                  ) : (
                      <div className="hidden sm:block sm:col-span-2"></div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2 p-3 bg-emerald-50/50 border border-emerald-100 rounded-md">
                    <Label htmlFor="sale_price" className="text-emerald-800">Satış (Tahsilat) Rakamı</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500" />
                      <Input id="sale_price" name="sale_price" type="number" step="0.01" defaultValue={share.sale_price} required className="pl-9 bg-white border-emerald-200 focus-visible:ring-emerald-300 font-semibold" />
                    </div>
                  </div>
                  <div className="grid gap-2 p-3 bg-slate-50/80 border border-slate-200 rounded-md">
                    <Label htmlFor="cost_price" className="text-slate-700">Dernek Maliyeti</Label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input id="cost_price" name="cost_price" type="number" step="0.01" defaultValue={share.cost_price} required className="pl-9 bg-white" />
                    </div>
                  </div>
                </div>

              </div>
          </div>
          <div className="sticky bottom-0 bg-white pt-4 pb-4 mt-2 border-t flex flex-col sm:flex-row gap-3 px-1">
            {share.animal_id && (
              <Button type="button" variant="outline" onClick={onUnassign} className="sm:flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm font-semibold cursor-pointer gap-1" disabled={loading}>
                <Undo className="h-4 w-4" /> HAVUZA AL
              </Button>
            )}
            <Button type="button" variant="destructive" onClick={onDelete} className="sm:flex-1 shadow-sm cursor-pointer gap-1" disabled={loading}>
              <Trash2 className="h-4 w-4" /> KAYDI SİL
            </Button>
            <Button type="submit" className="sm:flex-1 shadow-md font-semibold cursor-pointer" disabled={loading}>
              {loading ? 'Güncelleniyor...' : 'KAYDET'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

