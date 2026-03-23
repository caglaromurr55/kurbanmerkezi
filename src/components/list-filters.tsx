'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition, useState } from 'react'

const TYPE_MAP: Record<string, string> = { 'ALL': 'Tüm Türler', 'HISSE_SATISI': 'Normal Hisse', 'BAGIS': 'Bağış Kurban', 'ADAK': 'Adak', 'AKIKA': 'Akika' }
const STATUS_MAP: Record<string, string> = { 'ALL': 'Tüm Durumlar', 'PAID': 'Tamamı Ödendi', 'PARTIAL': 'Kısmi Ödendi', 'PENDING': 'Ödenmedi' }

export function ListFilters({ showTypes = true }: { showTypes?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [query, setQuery] = useState(searchParams.get('q') || '')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    updateUrl('q', val)
  }

  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'ALL') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4 mt-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="İsim, telefon veya referans ara..." 
          className="pl-9 bg-white shadow-sm border-slate-200" 
          value={query}
          onChange={handleSearch}
        />
      </div>
      
      {showTypes && (
          <Select defaultValue={searchParams.get('type') || 'ALL'} onValueChange={(val) => updateUrl('type', val || 'ALL')}>
            <SelectTrigger className="bg-white shadow-sm sm:w-[180px]">
              <span className="truncate">{TYPE_MAP[searchParams.get('type') || 'ALL'] || 'Kurban Türü'}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tüm Türler</SelectItem>
              <SelectItem value="HISSE_SATISI">Normal Hisse</SelectItem>
              <SelectItem value="BAGIS">Bağış Kurban</SelectItem>
              <SelectItem value="ADAK">Adak</SelectItem>
              <SelectItem value="AKIKA">Akika</SelectItem>
            </SelectContent>
          </Select>
      )}

      <Select defaultValue={searchParams.get('status') || 'ALL'} onValueChange={(val) => updateUrl('status', val || 'ALL')}>
        <SelectTrigger className="bg-white shadow-sm sm:w-[180px]">
          <span className="truncate">{STATUS_MAP[searchParams.get('status') || 'ALL'] || 'Ödeme Durumu'}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tüm Durumlar</SelectItem>
          <SelectItem value="PAID">Tamamı Ödendi</SelectItem>
          <SelectItem value="PARTIAL">Kısmi Ödendi</SelectItem>
          <SelectItem value="PENDING">Ödenmedi</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
