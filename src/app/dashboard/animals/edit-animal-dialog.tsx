'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, CheckCircle2, Clock, Truck, Scissors } from 'lucide-react'
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
      if (!confirm('Bu hayvanı silmek istediğinize emin misiniz? Tüm hisseleri (eğer varsa) boşa çıkacaktır.')) return;
      
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
      <DialogContent className="w-[95vw] sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Hayvanı Düzenle</DialogTitle>
          <DialogDescription>
            Kurbanlık bilgilerini, kilosunu ve statüsünü güncelleyin.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-4 py-4 max-h-[80vh] overflow-y-auto px-1">
          <div className="grid gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2">
              <Label htmlFor="status" className="text-slate-700">Operasyon Durumu</Label>
              <Select name="status" value={status} onValueChange={(val) => setStatus(val || 'PENDING')} required>
                <SelectTrigger className="bg-white border-slate-200 shadow-sm font-semibold">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isYurtisi && (
                <div className="grid gap-2">
                  <Label htmlFor="ear_tag">Küpe Numarası</Label>
                  <Input id="ear_tag" name="ear_tag" defaultValue={animal.ear_tag} required />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="type">Hayvan Türü</Label>
                <Select name="type" required value={type} onValueChange={(val) => setType(val || 'BUYUKBAS')}>
                  <SelectTrigger disabled={currentSharesCount > 0}>
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
                <Label htmlFor="weight_group">Kilo Grubu / Açıklama</Label>
                <Input id="weight_group" name="weight_group" defaultValue={animal.weight_group} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="share_capacity">Hisse Kapasitesi</Label>
                <Input id="share_capacity" name="share_capacity" type="number" defaultValue={animal.share_capacity} required min={Math.max(1, currentSharesCount)} max={7} />
                <span className="text-[10px] text-slate-500">Mevcut kayıtlardan ({currentSharesCount}) küçük olamaz.</span>
              </div>
          </div>

          {isYurtisi && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4 mt-2 border-slate-100">
                <div className="grid gap-2">
                    <Label htmlFor="price_per_kg">Alış Canlı KG (₺)</Label>
                    <Input id="price_per_kg" name="price_per_kg" type="number" step="0.01" defaultValue={animal.price_per_kg || 0} required className="font-medium" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="initial_weight">İlk Kilo (KG)</Label>
                    <Input id="initial_weight" name="initial_weight" type="number" step="0.01" defaultValue={animal.initial_weight || 0} required className="font-medium" />
                </div>
                <div className="grid gap-2 bg-emerald-50 p-2 rounded -m-2">
                    <Label htmlFor="final_weight" className="text-emerald-800">Son Karkas (KG)</Label>
                    <Input id="final_weight" name="final_weight" type="number" step="0.01" defaultValue={animal.final_weight || 0} required className="font-bold border-emerald-200 focus-visible:ring-emerald-400 bg-white" />
                </div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Button type="button" variant="destructive" onClick={onDelete} className="w-1/3 shadow-sm" disabled={loading}>
              SİL
            </Button>
            <Button type="submit" className="w-2/3 shadow-md bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Güncelleniyor...' : 'Hayvanı Güncelle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
