'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
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
      <DialogContent className="sm:max-w-[600px] h-[90vh] sm:h-auto overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Kurbana Hisse Ekle</DialogTitle>
          <DialogDescription>
            <strong>{animalTag}</strong> küpeli ({animalRegion}) hayvana doğrudan veya havuzdan kişi ekliyorsunuz.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="new" className="flex flex-col flex-1 overflow-hidden mt-4">
          <TabsList className="grid w-full grid-cols-2 shrink-0">
            <TabsTrigger value="new">Yeni Kişi Ekle</TabsTrigger>
            <TabsTrigger value="existing">Havuzdan Seç ({unassignedShares?.length || 0})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new" className="flex-1 overflow-y-auto mt-2 px-1">
            <form action={onSubmit} className="flex flex-col h-full">
              <div className="grid gap-5 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="donor_name">Bağışçı Adı Soyadı</Label>
                  <Input id="donor_name" name="donor_name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="donor_phone">Telefon Numarası</Label>
                  <Input id="donor_phone" name="donor_phone" placeholder="+905551234567" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
                <div className="grid gap-2">
                  <Label htmlFor="share_type">Kurban Türü</Label>
                  <Select name="share_type" value={shareType} onValueChange={(val) => setShareType(val || '')} required>
                    <SelectTrigger>
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
                  <Label htmlFor="reference_name">Referans Grubu</Label>
                  <Input id="reference_name" name="reference_name" placeholder="Örn: Ahmet Hoca" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="currency">Para Birimi</Label>
                  <Select name="currency" value={currency} onValueChange={(val) => setCurrency(val || '')} required>
                    <SelectTrigger>
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
                      <Label htmlFor="exchange_rate">Anlık Kur (1 {currency} = ? TL)</Label>
                      <Input id="exchange_rate" name="exchange_rate" type="number" step="0.0001" defaultValue={1.0} required />
                    </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2 p-3 bg-emerald-50/50 border border-emerald-100 rounded-md">
                  <Label htmlFor="sale_price" className="text-emerald-800">Satış Tutarı (Hisse Bedeli)</Label>
                  <Input id="sale_price" name="sale_price" type="number" step="0.01" required placeholder="0.00" className="bg-white border-emerald-200 focus-visible:ring-emerald-300 font-semibold" />
                </div>
                <div className="grid gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-md">
                  <Label htmlFor="initial_payment" className="text-blue-800">Alınan Tahsilat / Peşinat</Label>
                  <Input id="initial_payment" name="initial_payment" type="number" step="0.01" defaultValue="" placeholder="0.00" className="bg-white border-blue-200 focus-visible:ring-blue-300 font-semibold" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="grid gap-2 p-3 bg-slate-50/80 border border-slate-200 rounded-md">
                  <Label htmlFor="cost_price" className="text-slate-700">Dernek Maliyeti</Label>
                  <Input id="cost_price" name="cost_price" type="number" step="0.01" required placeholder="0.00" className="bg-white" />
                </div>
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
              <div className="sticky bottom-0 bg-white pt-2 pb-4 mt-2">
                <Button type="submit" className="w-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
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
