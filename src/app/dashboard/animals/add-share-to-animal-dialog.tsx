'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, User, Phone, Tags, Link2, Wallet, DollarSign, ArrowRightLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createShare, assignShareToAnimal } from '../shares/actions'

export function AddShareToAnimalDialog({ campaignId, animalId, animalTag, animalRegion, unassignedShares = [] }: { campaignId: string, animalId: string, animalTag: string, animalRegion: string, unassignedShares?: any[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const SHARE_TYPE_MAP: Record<string, string> = { HISSE_SATISI: 'Normal Hisse', BAGIS: 'Bağış Kurban', ADAK: 'Adak', AKIKA: 'Akika' }
  const CURRENCY_MAP: Record<string, string> = { TRY: 'Türk Lirası (₺)', USD: 'Dolar ($)', EUR: 'Euro (€)' }
  const PAYMENT_MAP: Record<string, string> = { PAID: 'Tamamı Ödendi', PARTIAL: 'Kısmi Ödendi (Avans)', PENDING: 'Ödenmedi / Bekliyor' }
  
  const [shareType, setShareType] = useState('HISSE_SATISI')
  const [currency, setCurrency] = useState('TRY')
  const [paymentMethod, setPaymentMethod] = useState('CASH')

  async function onSubmit(formData: FormData) {
    setLoading(true)
    formData.append('campaign_id', campaignId)
    formData.append('animal_id', animalId)
    formData.append('region', animalRegion || 'YURTICI')
    await createShare(formData)
    setLoading(false)
    setOpen(false)
  }

  async function onAssign(formData: FormData) {
    setLoading(true)
    formData.append('animal_id', animalId)
    await assignShareToAnimal(formData)
    setLoading(false)
    setOpen(false)
  }

  const isForeign = currency !== 'TRY'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="sm" variant="outline" className="w-full text-xs shadow-md bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 font-extrabold uppercase tracking-wider transition-all duration-300">
          <PlusCircle className="mr-2 h-4 w-4" /> Hisse Sahibi Ekle
        </Button>
      } />
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Kurbana Hisse Ekle</DialogTitle>
          <DialogDescription>
            <strong>{animalTag}</strong> küpeli ({animalRegion}) hayvana doğrudan veya havuzdan kişi ekliyorsunuz.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="new" className="flex flex-col flex-1 overflow-hidden mt-2">
          <TabsList className="grid w-full grid-cols-2 shrink-0">
            <TabsTrigger value="new">Yeni Kişi Ekle</TabsTrigger>
            <TabsTrigger value="existing">Havuzdan Seç ({unassignedShares?.length || 0})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new" className="flex-1 overflow-y-auto px-1 mt-2">
            <form action={onSubmit} className="flex flex-col">
              <div className="grid gap-6 py-2">
              
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
                        <Input id="donor_name" name="donor_name" required className="pl-9 bg-slate-50/50" placeholder="Örn: Ahmet Yılmaz" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="donor_phone" className="text-slate-600">Telefon Numarası</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                        <Input id="donor_phone" name="donor_phone" placeholder="+905551234567" className="pl-9 bg-slate-50/50" />
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="share_type" className="text-slate-600">Kurban Türü</Label>
                      <Select name="share_type" value={shareType} onValueChange={(val) => setShareType(val || '')} required>
                        <SelectTrigger className="bg-slate-50/50">
                          <span className="truncate">{shareType ? SHARE_TYPE_MAP[shareType] : 'Tür seçiniz'}</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HISSE_SATISI">Normal Hisse</SelectItem>
                          <SelectItem value="BAGIS">Bağış Kurban</SelectItem>
                          <SelectItem value="ADAK">Adak</SelectItem>
                          <SelectItem value="AKIKA">Akika</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="reference_name" className="text-slate-600">Referans Grubu (Opsiyonel)</Label>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                        <Input id="reference_name" name="reference_name" placeholder="Örn: Ahmet Hoca" className="pl-9 bg-slate-50/50" />
                      </div>
                    </div>
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
                      <Select name="currency" value={currency} onValueChange={(val) => setCurrency(val || '')} required>
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
                            <Input id="exchange_rate" name="exchange_rate" type="number" step="0.0001" defaultValue={1.0} required className="pl-9 bg-slate-50/50" />
                          </div>
                        </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2 p-3 bg-emerald-50/50 border border-emerald-100 rounded-md">
                      <Label htmlFor="sale_price" className="text-emerald-800">Satış Tutarı (Hisse Bedeli)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2 h-4 w-4 text-emerald-500" />
                        <Input id="sale_price" name="sale_price" type="number" step="0.01" required placeholder="0.00" className="pl-9 bg-white border-emerald-200 focus-visible:ring-emerald-300 font-semibold" />
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

                  <div className="grid grid-cols-1 gap-4 pt-2">
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
                <Button type="submit" className="shadow-md px-8 bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                  {loading ? 'Kaydediliyor...' : 'Doğrudan Atama Yap'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="existing" className="flex-1 overflow-y-auto mt-2 px-1">
             <form action={onAssign} className="flex flex-col gap-4 py-2 h-full">
               <div className="grid gap-2 flex-1">
                 <Label>Havuzdaki Hissedarlar (Henüz atanmamış)</Label>
                 <Select name="share_id" required>
                   <SelectTrigger className="bg-slate-50">
                     <SelectValue placeholder="Bir hissedar seçin..." />
                   </SelectTrigger>
                   <SelectContent>
                     {unassignedShares?.length > 0 ? unassignedShares.map(s => (
                       <SelectItem key={s.id} value={s.id}>
                         {s.donor_name} {s.reference_name ? `(${s.reference_name})` : ''} - {SHARE_TYPE_MAP[s.share_type] || s.share_type}
                       </SelectItem>
                     )) : (
                       <SelectItem value="none" disabled>Havuza bırakılan kişi yok</SelectItem>
                     )}
                   </SelectContent>
                 </Select>
               </div>
               <div className="sticky bottom-0 bg-white pt-6 pb-4 mt-2">
                 <Button type="submit" className="w-full shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading || unassignedShares?.length === 0}>
                   {loading ? 'Atanıyor...' : 'Seçili Kişiyi Hayvana Ata'}
                 </Button>
               </div>
             </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
