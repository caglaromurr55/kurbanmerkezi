'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, User, Phone, Tags, Link2, Wallet, DollarSign, ArrowRightLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createShare } from './actions'

export function AddShareDialog({ campaignId, animals, defaultInternationalPrice, defaultInternationalSalePriceTl, fixedUsdRate, defaultRegion = 'YURTICI' }: { campaignId: string, animals: any[], defaultInternationalPrice?: number, defaultInternationalSalePriceTl?: number, fixedUsdRate?: number, defaultRegion?: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const SHARE_TYPE_MAP: Record<string, string> = { HISSE_SATISI: 'Normal Hisse', BAGIS: 'Bağış Kurban', ADAK: 'Adak', AKIKA: 'Akika', DIGER: 'Diğer (Belirtiniz)' }
  const REGION_MAP: Record<string, string> = { YURTICI: 'Yurtiçi', YURTDISI: 'Yurtdışı' }
  const CURRENCY_MAP: Record<string, string> = { TRY: 'Türk Lirası (₺)', USD: 'Dolar ($)', EUR: 'Euro (€)' }
  const PAYMENT_MAP: Record<string, string> = { PAID: 'Tamamı Ödendi', PARTIAL: 'Kısmi Ödendi (Avans)', PENDING: 'Ödenmedi / Bekliyor' }

  const [shareType, setShareType] = useState(defaultRegion === 'YURTDISI' ? 'BAGIS' : 'HISSE_SATISI')
  const [customShareType, setCustomShareType] = useState('')
  const [region, setRegion] = useState(defaultRegion)
  const [currency, setCurrency] = useState(defaultRegion === 'YURTDISI' ? 'USD' : 'TRY')
  const [selectedAnimalId, setSelectedAnimalId] = useState('none')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  
  const [salePrice, setSalePrice] = useState<string>('')
  const [exchangeRate, setExchangeRate] = useState<string>('1.0')

  useEffect(() => {
    if (open) {
      handleRegionChange(defaultRegion)
    }
  }, [open, defaultRegion, defaultInternationalSalePriceTl, defaultInternationalPrice, fixedUsdRate])

  // Bölge değiştiğinde varsayılanları uygula
  const handleRegionChange = (val: string | null) => {
    if (!val) return
    setRegion(val)
    if (val === 'YURTDISI') {
      setShareType('BAGIS')
      setCurrency('USD')
      if (defaultInternationalSalePriceTl) setSalePrice(defaultInternationalSalePriceTl.toString())
      if (fixedUsdRate) setExchangeRate(fixedUsdRate.toString())
    } else {
      setCurrency('TRY')
      setExchangeRate('1.0')
      setSalePrice('')
    }
  }

  const handleCurrencyChange = (val: string | null) => {
    if (!val) return
    setCurrency(val)
    if (val !== 'TRY' && fixedUsdRate) {
        setExchangeRate(fixedUsdRate.toString())
    } else {
        setExchangeRate('1.0')
    }
  }

  async function onSubmit(formData: FormData) {
    setLoading(true)
    formData.append('campaign_id', campaignId)
    if (shareType === 'DIGER') {
        formData.set('share_type', customShareType || 'DİĞER')
    }
    try {
      await createShare(formData)
      setOpen(false)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const isForeign = currency !== 'TRY'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusCircle className="mr-2 h-4 w-4" /> Hisse / Bağış Ekle
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Yeni Bağışçı (Hisse / Bağış)</DialogTitle>
          <DialogDescription>
            Sisteme manuel hisse, adak veya akika kaydı girin.
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
                      <User className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                      <Input id="donor_name" name="donor_name" className="pl-9 bg-slate-50/50" required placeholder="Örn: Ahmet Yılmaz" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="donor_phone" className="text-slate-600">Telefon Numarası</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                      <Input id="donor_phone" name="donor_phone" className="pl-9 bg-slate-50/50" placeholder="+90 555 123 45 67" />
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="share_type" className="text-slate-600">Kurban Türü</Label>
                    <Select name="share_type" value={shareType} onValueChange={(val) => setShareType(val || '')} required>
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
                  
                  <div className="grid gap-2">
                    <Label htmlFor="animal_id" className="text-slate-600">Hayvan Ataması</Label>
                    <Select name="animal_id" value={selectedAnimalId} onValueChange={(val) => setSelectedAnimalId(val || 'none')}>
                      <SelectTrigger className="bg-slate-50/50 border-blue-200">
                        <span className="truncate">{selectedAnimalId === 'none' ? 'Havuza Bırak (Karışık Dağıt)' : animals?.find(a => a.id === selectedAnimalId)?.ear_tag || 'Hayvan seçin...'}</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="font-medium text-blue-600">Havuza Bırak (Karışık Dağıt)</SelectItem>
                        {animals?.map((a: any) => (
                            <SelectItem key={a.id} value={a.id}>{a.ear_tag} - {a.type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {shareType === 'DIGER' && (
                  <div className="grid gap-2 p-3 bg-orange-50 rounded-md border border-orange-100">
                    <Label htmlFor="custom_share_type" className="text-orange-800">Kurban Türü Belirtiniz</Label>
                    <Input id="custom_share_type" value={customShareType} onChange={(e) => setCustomShareType(e.target.value)} placeholder="Örn: Şükür Kurbanı" className="bg-white border-orange-200 focus-visible:ring-orange-300" required />
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
                  <Input id="reference_name" name="reference_name" placeholder="Örn: Ahmet Hoca Cemaati" className="bg-white border-blue-200 focus-visible:ring-blue-300" />
                </div>
              </div>

              {/* Bölüm 3: Finansal Detaylar */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Wallet className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-slate-800">Finansal Tahsilat</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currency" className="text-slate-600">Para Birimi</Label>
                    <Select name="currency" value={currency} onValueChange={handleCurrencyChange} required>
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
                  
                  {isForeign && (
                      <div className="grid gap-2">
                        <Label htmlFor="exchange_rate" className="text-slate-600">Anlık Kur (1 {currency} = ? TL)</Label>
                        <div className="relative">
                          <ArrowRightLeft className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                          <Input id="exchange_rate" name="exchange_rate" type="number" step="0.0001" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} className="pl-9 bg-slate-50/50" required />
                        </div>
                      </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2 p-3 bg-emerald-50/50 border border-emerald-100 rounded-md">
                    <Label htmlFor="sale_price" className="text-emerald-800">Satış Tutarı (Hisse Bedeli)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2 h-4 w-4 text-emerald-500" />
                      <Input id="sale_price" name="sale_price" type="number" step="0.01" value={salePrice} onChange={e => setSalePrice(e.target.value)} required placeholder="0.00" className="pl-9 bg-white border-emerald-200 focus-visible:ring-emerald-300 font-semibold" />
                    </div>
                  </div>
                  <div className="grid gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-md">
                    <Label htmlFor="initial_payment" className="text-blue-800">Alınan Tahsilat / Peşinat</Label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-2 h-4 w-4 text-blue-500" />
                      <Input id="initial_payment" name="initial_payment" type="number" step="0.01" defaultValue="" placeholder="0.00" className="pl-9 bg-white border-blue-200 focus-visible:ring-blue-300 font-semibold" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 pt-2">
                  <div className="grid gap-2 p-3 bg-slate-50/80 border border-slate-200 rounded-md">
                    <Label htmlFor="payment_method" className="text-slate-600">Ödeme Yöntemi</Label>
                    <Select name="payment_method" value={paymentMethod} onValueChange={(val) => setPaymentMethod(val || 'CASH')}>
                      <SelectTrigger className="bg-white">
                        <span className="truncate">{paymentMethod === 'CASH' ? 'Nakit' : paymentMethod === 'CREDIT_CARD' ? 'Kredi Kartı' : 'Havale/EFT'}</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Nakit</SelectItem>
                        <SelectItem value="CREDIT_CARD">Kredi Kartı</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Havale/EFT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

              </div>
          </div>
          <div className="sticky bottom-0 bg-white pt-4 pb-4 mt-2 border-t flex justify-end gap-3 px-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                İptal
            </Button>
            <Button type="submit" className="shadow-md px-8" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Bağışçıyı Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
