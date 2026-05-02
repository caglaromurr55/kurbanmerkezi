import { createClient } from '@/utils/supabase/server'
import { AddAnimalDialog } from '../../animals/add-animal-dialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AddShareToAnimalDialog } from '../../animals/add-share-to-animal-dialog'
import { EditShareDialog } from '../../animals/edit-share-dialog'
import { EditVideoDialog } from '../../animals/edit-video-dialog'
import { Users, Scale, Tag } from 'lucide-react'

export default async function YurtdisiAnimalsPage() {
  const supabase = await createClient()
  
  const { data: activeCampaign } = await supabase.from('campaigns').select('id').eq('is_active', true).single()
  
  let animals: any[] = []
  let unassignedShares: any[] = []
  if (activeCampaign) {
    const { data } = await supabase.from('animals').select('*, shares(*)').eq('campaign_id', activeCampaign.id).eq('region', 'YURTDISI').order('created_at', { ascending: false })
    animals = data || []

    const { data: sData } = await supabase.from('shares').select('id, donor_name, share_type, reference_name').eq('campaign_id', activeCampaign.id).eq('region', 'YURTDISI').is('animal_id', null).order('created_at', { ascending: false })
    unassignedShares = sData || []
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in py-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 border-l-4 border-blue-500 pl-3">Yurtdışı Kurbanlıklar</h1>
            <p className="text-slate-500 font-medium pl-4">Yurtdışı operasyonlarındaki hayvan eşleştirmeleri ve kurbanlıklar.</p>
        </div>
        {activeCampaign && <AddAnimalDialog campaignId={activeCampaign.id} defaultRegion="YURTDISI" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {animals.map((animal) => {
              const currentSharesCount = animal.shares?.length || 0;
              const isFull = currentSharesCount >= animal.share_capacity;
              
              return (
                  <Card key={animal.id} className="glass-card overflow-hidden group transition-all duration-300 hover:shadow-xl border-slate-200">
                    <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                <Tag className="w-4 h-4 text-primary" />
                                {animal.ear_tag || 'İsimsiz'}
                                {animal.shares?.find((s: any) => s.reference_name)?.reference_name && (
                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-blue-100 shadow-sm">
                                        {animal.shares.find((s: any) => s.reference_name).reference_name}
                                    </span>
                                )}
                            </CardTitle>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold tracking-wider uppercase ${animal.type === 'BUYUKBAS' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                            {animal.type === 'BUYUKBAS' ? 'Büyükbaş' : 'Küçükbaş'}
                        </span>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5 text-sm mb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-slate-600 font-medium tooltip" title={animal.weight_group || 'Kilo Belirtilmedi'}>
                                    <Scale className="w-4 h-4 opacity-70 text-emerald-600" /> {animal.initial_weight || 0} KG <span className="opacity-50">→</span> {animal.final_weight || 0} KG
                                </div>
                                <span className="px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">{animal.status}</span>
                            </div>
                            <div className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                                Canlı Kilo: <span className="text-slate-700">₺{animal.price_per_kg || 0}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5" /> Hisse Durumu
                                </span>
                                <span className={`text-sm font-extrabold ${isFull ? 'text-emerald-600' : 'text-slate-700'}`}>
                                    {currentSharesCount} / {animal.share_capacity}
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                                {Array.from({ length: animal.share_capacity }).map((_, i) => (
                                    <div key={i} className={`flex-1 h-full border-r border-white/50 last:border-0 ${i < currentSharesCount ? 'bg-primary' : 'bg-slate-200/50'}`} />
                                ))}
                            </div>
                        </div>

                        {currentSharesCount > 0 && (
                            <div className="flex flex-col gap-1.5 mt-2 bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kayıtlı Hissedarlar</span>
                                {animal.shares.map((share: any, idx: number) => (
                                    <div key={share.id} className="flex items-center justify-between group/share py-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400">{idx + 1}.</span>
                                            <span className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">{share.donor_name}</span>
                                        </div>
                                        <div className="opacity-0 group-hover/share:opacity-100 transition-opacity">
                                            <EditShareDialog share={share} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="pt-3 mt-1 border-t border-slate-100 grid gap-2">
                           {!isFull && activeCampaign ? (
                               <AddShareToAnimalDialog campaignId={activeCampaign.id} animalId={animal.id} animalTag={animal.ear_tag} animalRegion={animal.region} unassignedShares={unassignedShares} />
                           ) : (
                               <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-center w-full uppercase tracking-widest shadow-sm">TAMAMLANDI</span>
                           )}
                           <EditVideoDialog animal={animal} />
                        </div>
                    </CardContent>
                  </Card>
              )
          })}
          
          {animals.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 bg-white/40 backdrop-blur-md rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-lg font-medium">Bu bölgede henüz bir hayvan kaydı bulunmuyor.</p>
              </div>
          )}
      </div>
    </div>
  )
}
