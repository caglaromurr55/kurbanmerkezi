'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, CheckCircle2, Clock, Truck, Scissors, Beef, Hash, Tags, Scale, DollarSign, Activity } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateAnimal, deleteAnimal } from './actions'

export function EditAnimalDialog({ animal }: { animal: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(animal.status || 'PENDING')
  const [type, setType] = useState(animal.type || 'BUYUKBAS')
  const STATUS_MAP: Record<string, string> = { PENDING: 'Bekliyor', SLAUGHTERED: 'Kesildi', BUTCHERED: 'Parçalandı', COMPLETED: 'Tamamlandı' }
  
  const currentSharesCount = animal.shares?.length || 0

  async function onSubmit(formData: FormData) {
    setLoading(true)
    formData.append('id', animal.id)
    formData.append('region', animal.region)
    try {
      await updateAnimal(formData)
      setOpen(false)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onDelete() {
      if (!confirm('Bu hayvanı ve bağlı tüm hisse atamalarını silmek istediğinize emin misiniz?')) return;
      
      setLoading(true)
      const data = new FormData()
      data.append('id', animal.id)
      try {
          await deleteAnimal(data)
          setOpen(false)
      } catch (e: any) {
          alert(e.message)
      } finally {
          setLoading(false)
      }
  }

  const isYurtisi = animal.region !== 'YURTDISI'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors">
          <Edit className="h-4 w-4" />
        </div>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Hayvanı Düzenle</DialogTitle>
          <DialogDescription>
            Kurbanlık bilgilerini, kilosunu ve statüsünü güncelleyin.
          </DialogDescription>
        </DialogHeader>
        
        <form action={onSubmit} className="flex-1 overflow-y-auto px-1 mt-2">
          <div className="grid gap-6 py-2">

            {/* Bölüm 1: Operasyon Durumu */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-800">Operasyon Durumu</h3>
              </div>
              <div className="grid gap-2">
                  <Select name="status" value={status} onValueChange={(val) => setStatus(val || 'PENDING')} required>
                    <SelectTrigger className="bg-white border-slate-200 shadow-sm font-semibold h-11">
                      <span className="truncate">{STATUS_MAP[status] || 'Durum Seçin'}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">
                        <span className="flex items-center gap-2 text-slate-600"><Clock className="w-4 h-4"/> Bekliyor</span>
                      </SelectItem>
                      <SelectItem value="SLAUGHTERED">
                        <span className="flex items-center gap-2 text-red-600"><Scissors className="w-4 h-4"/> Kesildi</span>
                      </SelectItem>
                      <SelectItem value="BUTCHERED">
                        <span className="flex items-center gap-2 text-orange-600"><Scissors className="w-4 h-4"/> Parçalandı / Pay Edildi</span>
                      </SelectItem>
                      <SelectItem value="COMPLETED">
                        <span className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4"/> Dağıtıldı / Tamamlandı</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
              </div>
            </div>

            {/* Bölüm 2: Hayvan Tanımı */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Beef className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-slate-800">Hayvan Tanımı</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isYurtisi && (
                    <div className="grid gap-2">
                      <Label htmlFor="ear_tag" className="text-slate-600">Küpe Numarası</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                        <Input id="ear_tag" name="ear_tag" defaultValue={animal.ear_tag} required className="pl-9 bg-slate-50/50 uppercase" />
                      </div>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="type" className="text-slate-600">Hayvan Türü</Label>
                    <Select name="type" required value={type} onValueChange={(val) => setType(val || 'BUYUKBAS')}>
                      <SelectTrigger disabled={currentSharesCount > 0} className="bg-slate-50/50">
                        <span className="truncate">{type === 'BUYUKBAS' ? 'Büyükbaş' : 'Küçükbaş'}</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUYUKBAS">Büyükbaş</SelectItem>
                        <SelectItem value="KUCUKBAS">Küçükbaş</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="weight_group" className="text-slate-600">Kilo Grubu / Açıklama</Label>
                    <div className="relative">
                      <Tags className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                      <Input id="weight_group" name="weight_group" defaultValue={animal.weight_group} required className="pl-9 bg-slate-50/50" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="share_capacity" className="text-slate-600">Hisse Kapasitesi</Label>
                    <Input id="share_capacity" name="share_capacity" type="number" defaultValue={animal.share_capacity} required min={Math.max(1, currentSharesCount)} max={7} className="bg-slate-50/50" />
                    <span className="text-[10px] text-slate-500">Mevcut kayıtlardan ({currentSharesCount}) küçük olamaz.</span>
                  </div>
              </div>
            </div>

            {/* Bölüm 3: Kilo ve Maliyet */}
            {isYurtisi && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Scale className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-slate-800">Kilo ve Maliyet</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="grid gap-2 p-3 bg-slate-50/80 border border-slate-200 rounded-md">
                        <Label htmlFor="price_per_kg" className="text-slate-700 whitespace-nowrap text-xs sm:text-sm">Alış Canlı KG (₺)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                          <Input id="price_per_kg" name="price_per_kg" type="number" step="0.01" defaultValue={animal.price_per_kg || 0} required className="pl-8 bg-white font-medium text-sm" />
                        </div>
                    </div>
                    <div className="grid gap-2 p-3 bg-slate-50/80 border border-slate-200 rounded-md">
                        <Label htmlFor="initial_weight" className="text-slate-700 whitespace-nowrap text-xs sm:text-sm">İlk Kilo (KG)</Label>
                        <div className="relative">
                          <Scale className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                          <Input id="initial_weight" name="initial_weight" type="number" step="0.01" defaultValue={animal.initial_weight || 0} required className="pl-8 bg-white font-medium text-sm" />
                        </div>
                    </div>
                    <div className="grid gap-2 p-3 bg-emerald-50/50 border border-emerald-100 rounded-md">
                        <Label htmlFor="final_weight" className="text-emerald-800 whitespace-nowrap text-xs sm:text-sm">Son Karkas (KG)</Label>
                        <div className="relative">
                          <Scale className="absolute left-2.5 top-2 h-4 w-4 text-emerald-500" />
                          <Input id="final_weight" name="final_weight" type="number" step="0.01" defaultValue={animal.final_weight || 0} required className="pl-8 font-bold border-emerald-200 focus-visible:ring-emerald-400 bg-white text-sm" />
                        </div>
                    </div>
                </div>
              </div>
            )}
            
          </div>
          <div className="sticky bottom-0 bg-white pt-4 pb-4 mt-2 border-t flex gap-3 px-1">
            <Button type="button" variant="destructive" onClick={onDelete} className="w-1/3 shadow-sm" disabled={loading}>
              SİL
            </Button>
            <Button type="submit" className="w-2/3 shadow-md bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? 'Güncelleniyor...' : 'Hayvanı Güncelle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
