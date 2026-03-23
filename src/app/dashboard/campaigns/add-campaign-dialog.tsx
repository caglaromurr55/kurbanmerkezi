'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCampaign } from './actions'

export function AddCampaignDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    await createCampaign(formData)
    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusCircle className="mr-2 h-4 w-4" /> Yeni Dönem Ekle
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Dönem</DialogTitle>
          <DialogDescription>
            Sisteme yeni bir Kurban Dönemi (Kampanya) açın.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Dönem Adı</Label>
            <Input id="name" name="name" placeholder="Örn: 2026 Kurban Organizasyonu" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="year">Yıl</Label>
            <Input id="year" name="year" type="number" defaultValue={2026} required min={2024} max={2099} />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
