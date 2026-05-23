'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
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
  const [shareCapacity, setShareCapacity] = useState('7')

  const handleAnimalTypeChange = (val: string) => {
    setAnimalType(val)
    if (val === 'KUCUKBAS') {
      setShareCapacity('1')
    } else {
      setShareCapacity('7')
    }
  }

  async function onSubmit(formData: FormData) {
    setLoading(true)
    formData.append('campaign_id', campaignId)
    if (region === 'YURTDISI') {
      formData.set('ear_tag', `YD-${Date.now().toString().slice(-5)}`)
      formData.set('price_per_kg', '0')
      formData.set('initial_weight', '0')
      formData.set('final_weight', '0')
    }
    await createAnimal(formData)
    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusCircle className="mr-2 h-4 w-4" /> Hayvan Ekle
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Hayvan Ekle</DialogTitle>
          <DialogDescription>
            Sisteme yeni bir kurbanlık hayvan kaydedin.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
          {region !== 'YURTDISI' && (
            <div className="grid gap-2">
              <Label htmlFor="ear_tag">Küpe Numarası</Label>
              <Input id="ear_tag" name="ear_tag" required />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Hayvan Türü</Label>
                <Select name="type" required value={animalType} onValueChange={(val) => handleAnimalTypeChange(val || 'BUYUKBAS')}>
                  <SelectTrigger>
                    <span className="truncate">{animalType === 'BUYUKBAS' ? 'Büyükbaş' : 'Küçükbaş'}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUYUKBAS">Büyükbaş</SelectItem>
                    <SelectItem value="KUCUKBAS">Küçükbaş</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="region">Bölge</Label>
                <Select name="region" required value={region} onValueChange={(val) => setRegion(val || defaultRegion || 'YURTICI')}>
                  <SelectTrigger>
                    <span className="truncate">{region === 'YURTICI' ? 'Yurtiçi' : 'Yurtdışı'}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YURTICI">Yurtiçi</SelectItem>
                    <SelectItem value="YURTDISI">Yurtdışı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="weight_group">Kilo Grubu / Açıklama</Label>
                <Input id="weight_group" name="weight_group" placeholder="Örn: 200-250 KG" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="share_capacity">Hisse Kapasitesi</Label>
                <Input id="share_capacity" name="share_capacity" type="number" value={shareCapacity} onChange={e => setShareCapacity(e.target.value)} required min={1} max={7} />
              </div>
          </div>
          {region !== 'YURTDISI' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="price_per_kg">Canlı Kilo Fiyatı (₺)</Label>
                    <Input id="price_per_kg" name="price_per_kg" type="number" step="0.01" defaultValue={0} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="initial_weight">İlk Kilo (KG)</Label>
                    <Input id="initial_weight" name="initial_weight" type="number" step="0.01" defaultValue={0} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="final_weight">Güncel Kilo (KG)</Label>
                    <Input id="final_weight" name="final_weight" type="number" step="0.01" defaultValue={0} required />
                </div>
            </div>
          )}
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
