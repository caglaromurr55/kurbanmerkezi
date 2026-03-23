'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Link as LinkIcon } from 'lucide-react'
import { autoMatchShares } from './matchmaking'

export function AutoMatchButton({ campaignId }: { campaignId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleAutoMatch() {
    setLoading(true)
    try {
      const res = await autoMatchShares(campaignId)
      alert(`Başarılı! Toplam ${res.count} adet hisse hayvanlarla eşleştirildi.`)
    } catch (e: any) {
      alert("Eşleştirme sırasında hata: " + e.message)
    }
    setLoading(false)
  }

  return (
    <Button variant="outline" className="border-dashed border-primary/50 text-primary hover:text-primary hover:bg-primary/10" onClick={handleAutoMatch} disabled={loading}>
      <LinkIcon className="mr-2 h-4 w-4"/> 
      {loading ? 'Eşleştiriliyor...' : 'Otomatik Dağıt'}
    </Button>
  )
}
