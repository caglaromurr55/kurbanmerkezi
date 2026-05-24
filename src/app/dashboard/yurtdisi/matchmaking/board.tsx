'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tag, Users, ArrowUp, ArrowDown, Plus, HelpCircle, ArrowRightLeft, Undo, Phone, User, Check, Globe, ChevronDown, ChevronRight, GripVertical } from 'lucide-react'
import { bulkAssignSharesToAnimal, createNewMatchmakingAnimal } from './actions'
import { unassignShareFromAnimal } from '../../shares/actions'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface MatchmakingBoardProps {
  initialAnimals: any[]
  initialPendingShares: any[]
  campaignId: string
}

export function MatchmakingBoard({ initialAnimals, initialPendingShares, campaignId }: MatchmakingBoardProps) {
  const router = useRouter()
  const [animals, setAnimals] = useState<any[]>(initialAnimals)
  const [draggedGroup, setDraggedGroup] = useState<{ shareIds: string[]; name: string } | null>(null)
  const [dragOverAnimalId, setDragOverAnimalId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => {
      const current = prev[groupName] !== false // Default to open (true)
      return {
        ...prev,
        [groupName]: !current
      }
    })
  }

  // Sunucudan gelen kurban listesi güncellendiğinde yerel state'i güncelle
  useEffect(() => {
    setAnimals(initialAnimals)
  }, [initialAnimals])

  // 1. Bekleyen Hisseleri Gruplandır (Referansa Göre)
  const groups: Record<string, { name: string; shares: any[] }> = {}
  
  initialPendingShares.forEach(share => {
    const refKey = share.reference_name && share.reference_name.trim() !== ''
      ? share.reference_name.trim()
      : 'Bireysel Hisseler'
    
    if (!groups[refKey]) {
      groups[refKey] = {
        name: refKey,
        shares: []
      }
    }
    groups[refKey].shares.push(share)
  })

  // Bireysel Olmayanları (Grupları) yukarıda listelemek için sıralayalım
  const sortedGroups = Object.values(groups).sort((a, b) => {
    if (a.name === 'Bireysel Hisseler') return 1
    if (b.name === 'Bireysel Hisseler') return -1
    return b.shares.length - a.shares.length
  })

  // 2. Kurbanlık Sıralamasını Değiştir (Görsel Sıralama)
  const moveAnimal = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= animals.length) return

    const reordered = [...animals]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(nextIndex, 0, moved)
    setAnimals(reordered)
    toast.success('Kurban listesi sıralaması güncellendi (Görsel)')
  }

  // 3. Eşleştirme Tetikle (Bulk Assign)
  const handleAssign = async (shareIds: string[], groupName: string, animalId: string) => {
    setLoading(true)
    const animal = animals.find(a => a.id === animalId)
    if (!animal) return

    const currentSharesCount = animal.shares?.length || 0
    if (currentSharesCount + shareIds.length > (animal.share_capacity || 7)) {
      toast.error(`Kapasite aşımı! Bu kurbanda ${7 - currentSharesCount} kişilik yer var, atanmak istenen kişi sayısı ${shareIds.length}.`)
      setLoading(false)
      return
    }

    try {
      await bulkAssignSharesToAnimal(shareIds, animalId)
      router.refresh()
      if (shareIds.length === 1) {
        toast.success(`"${groupName}" kurbana başarıyla atandı!`)
      } else {
        toast.success(`"${groupName}" grubundaki ${shareIds.length} hissedar kurbana başarıyla atandı!`)
      }
    } catch (err: any) {
      toast.error('Atama hatası: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // 4. Eşleştirmeyi Kaldır (Havuza Geri Al)
  const handleUnassign = async (shareId: string, donorName: string) => {
    if (!confirm(`${donorName} isimli hissedarı hayvandan çıkarıp havuza geri almak istediğinize emin misiniz?`)) return
    
    setLoading(true)
    try {
      const data = new FormData()
      data.append('id', shareId)
      await unassignShareFromAnimal(data)
      router.refresh()
      toast.success(`${donorName} havuz eşleşmesine geri gönderildi.`)
    } catch (err: any) {
      toast.error('Kaldırma hatası: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // 5. Yeni Kurbanlık Ekle
  const handleCreateAnimal = async () => {
    setLoading(true)
    try {
      await createNewMatchmakingAnimal(campaignId)
      router.refresh()
      toast.success('Yeni yurtdışı kurbanlık başarıyla oluşturuldu!')
    } catch (err: any) {
      toast.error('Kurbanlık eklenirken hata oluştu: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in py-2">
      {/* Üst Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 border-l-4 border-blue-500 pl-3 flex items-center gap-2">
            <ArrowRightLeft className="w-8 h-8 text-blue-500" />
            Yurtdışı Sürükle-Bırak Eşleştirme Paneli
          </h1>
          <p className="text-slate-500 font-medium pl-4">
            Bağışçıları 7'li kurbanlık gruplarına sürükleyip bırakarak veya hızlı seçimle anında atayın.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleCreateAnimal}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer gap-1.5"
          >
            <Plus className="w-4 h-4" /> Yeni Kurbanlık Ekle
          </Button>
          <Link href="/dashboard/yurtdisi">
            <Button variant="outline" className="border-slate-200 font-semibold cursor-pointer">
              Geri Dön
            </Button>
          </Link>
        </div>
      </div>

      {/* Ana Çalışma Alanı (Split Pane) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SOL PANEL: Kurbanlıklar (7'li Gruplar) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 px-1">
            <Globe className="w-5 h-5 text-emerald-600" />
            Aktif Yurtdışı Kurbanlıklar ({animals.length} Hayvan)
          </h2>

          <div className="flex flex-col gap-4">
            {animals.map((animal, index) => {
              const currentShares = animal.shares || []
              const capacity = animal.share_capacity || 7
              const currentCount = currentShares.length
              const isFull = currentCount >= capacity
              const availableSlots = capacity - currentCount
              const dragOver = dragOverAnimalId === animal.id

              return (
                <div
                  key={animal.id}
                  onDragOver={(e) => {
                    e.preventDefault()
                    if (!isFull) e.dataTransfer.dropEffect = 'copy'
                  }}
                  onDragEnter={() => {
                    if (!isFull) setDragOverAnimalId(animal.id)
                  }}
                  onDragLeave={() => {
                    setDragOverAnimalId(null)
                  }}
                  onDrop={async (e) => {
                    e.preventDefault()
                    setDragOverAnimalId(null)
                    if (isFull) return

                    try {
                      const dataStr = e.dataTransfer.getData('text/plain')
                      if (dataStr) {
                        const { shareIds, groupName } = JSON.parse(dataStr)
                        await handleAssign(shareIds, groupName, animal.id)
                      }
                    } catch (err) {}
                  }}
                  className={`relative flex flex-col sm:flex-row items-stretch border rounded-2xl overflow-hidden transition-all duration-300 bg-white ${
                    dragOver
                      ? 'border-blue-500 ring-4 ring-blue-100 shadow-lg scale-[1.01]'
                      : 'border-slate-200/70 hover:shadow-md'
                  }`}
                >
                  {/* Sol Küçük Sıralama/Küpe Kısmı */}
                  <div className="sm:w-[120px] bg-slate-50/60 p-4 border-b sm:border-b-0 sm:border-r border-slate-200/50 flex flex-row sm:flex-col justify-between items-center text-center">
                    <div className="flex flex-col items-center">
                      <Tag className="w-5 h-5 text-blue-500 opacity-80 mb-1" />
                      <span className="font-extrabold text-sm text-slate-800 tracking-tight leading-none break-all max-w-[90px]">
                        {animal.ear_tag || 'İsimsiz'}
                      </span>
                    </div>

                    {/* Sıralama Okları */}
                    <div className="flex items-center sm:flex-col gap-1 mt-0 sm:mt-4">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => moveAnimal(index, 'up')}
                        disabled={index === 0}
                        className="h-7 w-7 rounded-lg hover:bg-slate-200 cursor-pointer disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => moveAnimal(index, 'down')}
                        disabled={index === animals.length - 1}
                        className="h-7 w-7 rounded-lg hover:bg-slate-200 cursor-pointer disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Orta Hisse Bilgileri */}
                  <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Kurban Hissedarları ({currentCount}/{capacity})
                        </span>
                      </div>
                      <Badge variant={isFull ? 'default' : 'secondary'} className={isFull ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0' : 'bg-slate-100 text-slate-700 border-0 font-bold'}>
                        {isFull ? 'KONTENJAN DOLU' : `${availableSlots} Boş Koltuk`}
                      </Badge>
                    </div>

                    {/* Hisse Kapsülü Görsel Gösterim */}
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-200/30">
                      {Array.from({ length: capacity }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 h-full rounded-sm transition-all duration-500 ${
                            i < currentCount ? 'bg-blue-600' : 'bg-slate-200/50'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Hissedar Listesi */}
                    <div className="grid gap-2">
                      {currentShares.map((share: any, idx: number) => (
                        <div
                          key={share.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100/50 hover:border-slate-200/80 transition-all text-sm font-semibold text-slate-700"
                        >
                          <div className="flex items-center gap-2 truncate max-w-[80%]">
                            <span className="text-xs font-bold text-slate-400">{idx + 1}.</span>
                            <span className="truncate">{share.donor_name}</span>
                            {share.reference_name && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-blue-200 bg-blue-50 text-blue-700 font-bold max-w-[120px] truncate">
                                {share.reference_name}
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleUnassign(share.id, share.donor_name)}
                            disabled={loading}
                            className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <Undo className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                      {currentCount === 0 && (
                        <div className="text-center py-6 text-xs font-bold text-slate-400 bg-slate-50/50 border border-dashed rounded-xl flex items-center justify-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-slate-300" />
                          Atama Bekliyor. Grupları buraya sürükleyin.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {animals.length === 0 && (
              <div className="text-center py-20 text-slate-400 bg-white border border-slate-200/60 rounded-[24px]">
                Bu kurban döneminde hiç yurtdışı kurbanlık bulunmuyor. Sağ üstten hemen oluşturun!
              </div>
            )}
          </div>
        </div>

        {/* SAĞ PANEL: Bekleyen Bağışçılar (Referans Grupları) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 px-1">
            <Users className="w-5 h-5 text-blue-600" />
            Bekleyen Bağışçılar ({initialPendingShares.length} Kişi)
          </h2>

          <div className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-1">
            {sortedGroups.map((group) => {
              const count = group.shares.length
              const isGroup = group.name !== 'Bireysel Hisseler'
              const shareIds = group.shares.map((s: any) => s.id)
              const isOpen = openGroups[group.name] !== false // Default to open (true)

              return (
                <div
                  key={group.name}
                  className={`relative flex flex-col shrink-0 overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 transition-all duration-300 hover:shadow-md ${
                    isGroup
                      ? 'border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/5'
                      : 'border-l-4 border-l-slate-400 bg-gradient-to-br from-white to-slate-50/5'
                  }`}
                >
                  {/* Header (Tıklanabilir Accordion & Draggable) */}
                  <div 
                    className="flex flex-row items-center justify-between gap-4 cursor-pointer select-none"
                    onClick={() => toggleGroup(group.name)}
                    draggable={isGroup}
                    onDragStart={(e) => {
                      if (!isGroup) return
                      e.dataTransfer.setData('text/plain', JSON.stringify({ 
                        shareIds: group.shares.map((s: any) => s.id), 
                        groupName: group.name 
                      }))
                      toast.info(`"${group.name}" grubu (${count} hissedar) sürükleniyor...`)
                    }}
                  >
                    <div className="flex items-center gap-2 max-w-[65%]">
                      {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                      <div className="flex flex-col gap-0.5">
                        <h3 className="text-sm font-extrabold text-slate-800 truncate leading-none">
                          {group.name}
                        </h3>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {isGroup ? 'Referans Grubu' : 'Bireysel Kayıtlar'}
                        </span>
                      </div>
                    </div>
                    
                    <Badge variant={isGroup ? 'default' : 'secondary'} className={`${isGroup ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-100'} border-0 font-extrabold text-[10px] px-2 py-0.5`}>
                      {count} HİSSEDAR
                    </Badge>
                  </div>

                  {/* Content (Sadece Açık Olduğunda Göster) */}
                  {isOpen && (
                    <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-100 animate-fade-in">
                      {/* Hissedar Kartları (Her biri ayrı ayrı sürüklenebilir) */}
                      <div className="flex flex-col gap-2">
                        {group.shares.map((share: any, sIdx: number) => (
                          <div
                            key={share.id}
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation() // Prevent triggering parent group drag!
                              e.dataTransfer.setData('text/plain', JSON.stringify({ 
                                shareIds: [share.id], 
                                groupName: share.donor_name 
                              }))
                              toast.info(`"${share.donor_name}" sürükleniyor...`)
                            }}
                            className="flex flex-col sm:flex-row sm:items-center shrink-0 justify-between p-3 rounded-xl bg-slate-50 border border-slate-150/60 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-md transition-all text-xs font-semibold text-slate-700 gap-2"
                          >
                            <div className="flex items-center gap-2 truncate max-w-[70%]">
                              <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0 cursor-grab active:cursor-grabbing" />
                              <span className="text-[10px] text-slate-400 font-bold shrink-0">{sIdx + 1}.</span>
                              <div className="flex flex-col truncate">
                                <span className="font-extrabold text-slate-800 truncate">{share.donor_name}</span>
                                <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-0.5 mt-0.5">
                                  <Phone className="w-2.5 h-2.5 opacity-60" /> {share.donor_phone || '-'}
                                </span>
                              </div>
                            </div>

                            {/* Hızlı Atama Dropdown (Mobil / Kolay kullanım) */}
                            <select
                              onChange={async (e) => {
                                const val = e.target.value
                                if (val && val !== '') {
                                  await handleAssign([share.id], share.donor_name, val)
                                  e.target.value = ''
                                }
                              }}
                              disabled={loading}
                              className="h-8 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-extrabold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 max-w-[120px] cursor-pointer"
                            >
                              <option value="">Kurban Seç...</option>
                              {animals.map((a) => {
                                const curr = a.shares?.length || 0
                                const avail = (a.share_capacity || 7) - curr
                                return (
                                  <option
                                    key={a.id}
                                    value={a.id}
                                    disabled={avail < 1}
                                    className="font-semibold text-slate-700"
                                  >
                                    {a.ear_tag || 'İsimsiz'} ({curr}/{a.share_capacity || 7})
                                  </option>
                                )
                              })}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            
            {initialPendingShares.length === 0 && (
              <div className="text-center py-20 text-slate-400 bg-white border border-dashed rounded-[24px]">
                Eşleştirilmeyi bekleyen hiçbir yurtdışı bağış kaydı bulunmuyor. Tüm hissedarlar kurbanlıklara atanmış!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
