'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, Beef, Hash, MapPin, Tags, Scale, Wallet, DollarSign } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createAnimal } from './actions'

export function AddAnimalDialog({ campaignId, defaultRegion = 'YURTICI' }: { campaignId: string, defaultRegion?: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [region, setRegion] = useState(defaultRegion)
  const [animalType, setAnimalType] = useState('BUYUKBAS')

  async function onSubmit(formData: FormData) {
    setLoading(true)
    formData.append('campaign_id', campaignId)
    if (region === 'YURTDISI') {
      formData.set('ear_tag', `YD-${Date.now().toString().slice(-5)}`)
      formData.set('price_per_kg', '0')
      formData.set('initial_weight', '0')
      formData.set('final_weight', '0')
    }
    try {
      await createAnimal(formData)
      setOpen(false)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusCircle className="mr-2 h-4 w-4" /> Hayvan Ekle
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Yeni Hayvan Ekle</DialogTitle>
          <DialogDescription>
            Sisteme yeni bir kurbanlık hayvan kaydedin.
          </DialogDescription>
        </DialogHeader>
        
        <form action={onSubmit} className="flex-1 overflow-y-auto px-1 mt-2">
          <div className="grid gap-6 py-2">
            
            {/* Bölüm 1: Hayvan Tanımı */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Beef className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-slate-800">Hayvan Tanımı</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {region !== 'YURTDISI' && (
                  <div className="grid gap-2">
                    <Label htmlFor="ear_tag" className="text-slate-600">Küpe Numarası</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                      <Input id="ear_tag" name="ear_tag" required className="pl-9 bg-slate-50/50 uppercase" placeholder="Örn: TR12345678" />
                    </div>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="type" className="text-slate-600">Hayvan Türü</Label>
                  <Select name="type" required value={animalType} onValueChange={(val) => setAnimalType(val || 'BUYUKBAS')}>
                    <SelectTrigger className="bg-slate-50/50">
                      <span className="truncate">{animalType === 'BUYUKBAS' ? 'Büyükbaş' : 'Küçükbaş'}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUYUKBAS">Büyükbaş</SelectItem>
                      <SelectItem value="KUCUKBAS">Küçükbaş</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="region" className="text-slate-600">Bölge</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 z-10" />
                    <Select name="region" required value={region} onValueChange={(val) => setRegion(val || defaultRegion || 'YURTICI')}>
                      <SelectTrigger className="bg-slate-50/50 pl-9">
                        <span className="truncate">{region === 'YURTICI' ? 'Yurtiçi' : 'Yurtdışı'}</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YURTICI">Yurtiçi</SelectItem>
                        <SelectItem value="YURTDISI">Yurtdışı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weight_group" className="text-slate-600">Kilo Grubu / Açıklama</Label>
                  <div className="relative">
                    <Tags className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                    <Input id="weight_group" name="weight_group" placeholder="Örn: 200-250 KG" required className="pl-9 bg-slate-50/50" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="share_capacity" className="text-slate-600">Hisse Kapasitesi</Label>
                  <Input id="share_capacity" name="share_capacity" type="number" defaultValue={7} required min={1} max={7} className="bg-slate-50/50" />
                </div>
              </div>
            </div>

            {/* Bölüm 2: Kilo ve Maliyet */}
            {region !== 'YURTDISI' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Scale className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-slate-800">Kilo ve Maliyet</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="grid gap-2 p-3 bg-emerald-50/50 border border-emerald-100 rounded-md">
                    <Label htmlFor="price_per_kg" className="text-emerald-800 whitespace-nowrap text-xs sm:text-sm">Canlı Kilo Fiyatı (₺)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-2 h-4 w-4 text-emerald-500" />
                      <Input id="price_per_kg" name="price_per_kg" type="number" step="0.01" defaultValue={0} required className="pl-8 bg-white border-emerald-200 focus-visible:ring-emerald-300 font-semibold text-sm" />
                    </div>
                  </div>
                  <div className="grid gap-2 p-3 bg-slate-50/80 border border-slate-200 rounded-md">
                    <Label htmlFor="initial_weight" className="text-slate-700 whitespace-nowrap text-xs sm:text-sm">İlk Kilo (KG)</Label>
                    <div className="relative">
                      <Scale className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                      <Input id="initial_weight" name="initial_weight" type="number" step="0.01" defaultValue={0} required className="pl-8 bg-white text-sm" />
                    </div>
                  </div>
                  <div className="grid gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-md">
                    <Label htmlFor="final_weight" className="text-blue-800 whitespace-nowrap text-xs sm:text-sm">Güncel Kilo (KG)</Label>
                    <div className="relative">
                      <Scale className="absolute left-2.5 top-2 h-4 w-4 text-blue-500" />
                      <Input id="final_weight" name="final_weight" type="number" step="0.01" defaultValue={0} required className="pl-8 bg-white border-blue-200 focus-visible:ring-blue-300 font-semibold text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
          <div className="sticky bottom-0 bg-white pt-4 pb-4 mt-2 border-t flex justify-end gap-3 px-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                İptal
            </Button>
            <Button type="submit" className="shadow-md px-8 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Hayvanı Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
