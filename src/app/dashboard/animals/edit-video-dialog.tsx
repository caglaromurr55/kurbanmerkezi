'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Video, Play } from 'lucide-react'
import { updateAnimalVideo } from './actions'

export function EditVideoDialog({ animal }: { animal: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    formData.append('id', animal.id)
    try {
      await updateAnimalVideo(formData)
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
        <Button size="sm" variant={animal.video_url ? "outline" : "secondary"} className={`w-full text-xs shadow-md font-extrabold uppercase tracking-wider transition-all duration-300 ${animal.video_url ? 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'}`}>
           {animal.video_url ? <><Play className="mr-2 h-4 w-4" /> Videoyu Güncelle</> : <><Video className="mr-2 h-4 w-4" /> Kesim Videosu Ekle</>}
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kesim Videosu</DialogTitle>
          <DialogDescription>
            Kurban kesim videosunun bağlantısını (YouTube, Google Drive vb.) ekleyin. Müşterileriniz bu bağlantıdan videoyu izleyecektir.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="video_url">Video Bağlantı Adresi (URL)</Label>
            <Input id="video_url" name="video_url" defaultValue={animal.video_url || ''} placeholder="https://youtube.com/..." required />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Bağlantıyı Kaydet'}
          </Button>
          {animal.video_url && (
            <a href={animal.video_url} target="_blank" rel="noreferrer" className="text-center text-sm font-semibold text-blue-600 hover:underline mt-2 flex items-center justify-center gap-1">
              <Play className="w-4 h-4" /> Mevcut Videoyu İzle
            </a>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
