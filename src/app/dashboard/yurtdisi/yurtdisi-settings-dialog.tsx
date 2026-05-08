'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'
import { updateYurtdisiSettingsAction } from './actions'

export function YurtdisiSettingsDialog({ settings }: { settings: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    try {
      await updateYurtdisiSettingsAction(formData)
      setOpen(false)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
          <Button variant="outline" className="text-slate-600 font-semibold shadow-sm border-slate-200 bg-white">
            <Settings className="mr-2 h-4 w-4" /> Ayarlar
          </Button>
      } />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yurtdışı Form Ayarları</DialogTitle>
          <DialogDescription>
            Yurtdışı bağış formlarında otomatik doldurulacak varsayılan dernek maliyeti ve TL satış fiyatını belirleyin.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="default_international_price">Dernek Dışı Maliyet (Döviz Cinsinden)</Label>
            <Input id="default_international_price" name="default_international_price" type="number" step="0.01" defaultValue={settings?.default_international_price || 0} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="default_international_sale_price_tl">Varsayılan TL Satış Fiyatı (Bağışçı Ödemesi)</Label>
            <Input id="default_international_sale_price_tl" name="default_international_sale_price_tl" type="number" step="0.01" defaultValue={settings?.default_international_sale_price_tl || 0} required />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
