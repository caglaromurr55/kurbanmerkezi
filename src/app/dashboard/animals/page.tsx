import { createClient } from '@/utils/supabase/server'
import { AddAnimalDialog } from './add-animal-dialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AddShareToAnimalDialog } from './add-share-to-animal-dialog'
import { EditShareDialog } from './edit-share-dialog'
import { EditVideoDialog } from './edit-video-dialog'
import { EditAnimalDialog } from './edit-animal-dialog'
import { Users, Scale, Tag, Clock, Scissors, CheckCircle2 } from 'lucide-react'

import { PrintButton } from '@/components/print-button'

export default async function AnimalsPage() {
  const supabase = await createClient()
  
  const { data: activeCampaign } = await supabase.from('campaigns').select('id, name').eq('is_active', true).single()
  
  let animals: any[] = []
  let unassignedShares: any[] = []
  if (activeCampaign) {
    const { data } = await supabase.from('animals').select('*, shares(*)').eq('campaign_id', activeCampaign.id).eq('region', 'YURTICI').order('created_at', { ascending: false })
    animals = data || []

    const { data: sData } = await supabase.from('shares').select('id, donor_name, share_type, reference_name').eq('campaign_id', activeCampaign.id).eq('region', 'YURTICI').is('animal_id', null).order('created_at', { ascending: false })
    unassignedShares = sData || []
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in py-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Yurtiçi Kurbanlıklar</h1>
            <p className="text-slate-500 font-semibold text-sm print:hidden">Sisteme kayıtlı yurtiçi kurbanlıklar ve hisse doluluk oranları.</p>
            <p className="text-slate-500 font-bold text-sm hidden print:block">Aktif Dönem: {activeCampaign?.name || ''}</p>
        </div>
        <div className="flex items-center gap-2">
            {activeCampaign && <PrintButton />}
            {activeCampaign && <AddAnimalDialog campaignId={activeCampaign.id} />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 print:hidden">
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
                                {animal.weight_group && (
                                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-emerald-100 shadow-sm">
                                        {animal.weight_group}
                                    </span>
                                )}
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold tracking-wider uppercase ${animal.type === 'BUYUKBAS' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                                {animal.type === 'BUYUKBAS' ? 'Büyükbaş' : 'Küçükbaş'}
                            </span>
                            <EditAnimalDialog animal={animal} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5 text-sm mb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-slate-600 font-medium tooltip" title={animal.weight_group || 'Kilo Belirtilmedi'}>
                                    <Scale className="w-4 h-4 opacity-70 text-emerald-600" /> {animal.initial_weight || 0} KG <span className="opacity-50">→</span> {animal.final_weight || 0} KG
                                </div>
                                {animal.status === 'PENDING' && <span className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider"><Clock className="w-3 h-3"/> Bekliyor</span>}
                                {animal.status === 'SLAUGHTERED' && <span className="flex items-center gap-1 px-2 py-1 rounded bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider"><Scissors className="w-3 h-3"/> Kesildi</span>}
                                {animal.status === 'BUTCHERED' && <span className="flex items-center gap-1 px-2 py-1 rounded bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold uppercase tracking-wider"><Scissors className="w-3 h-3"/> Parçalandı</span>}
                                {animal.status === 'COMPLETED' && <span className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 className="w-3 h-3"/> Dağıtıldı</span>}
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
                                {animal.shares.map((share: any, idx: number) => {
                                    const paymentColor = share.payment_status === 'PAID' ? 'text-emerald-600' : share.payment_status === 'PARTIAL' ? 'text-amber-500' : 'text-rose-600';
                                    return (
                                    <div key={share.id} className="flex items-center justify-between group/share py-0.5 border-b border-slate-100/50 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400">{idx + 1}.</span>
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-extrabold truncate max-w-[130px] ${paymentColor}`}>{share.donor_name}</span>
                                                {(share.reference_name || share.share_type) && (
                                                    <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[130px]">
                                                        {share.reference_name ? share.reference_name : (share.share_type === 'BAGIS' ? 'Bağış' : share.share_type === 'ADAK' ? 'Adak' : share.share_type === 'AKIKA' ? 'Akika' : 'Normal')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover/share:opacity-100 transition-opacity">
                                            <EditShareDialog share={share} />
                                        </div>
                                    </div>
                                    )
                                })}
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
                <p className="text-lg font-medium">Sistemde henüz bir hayvan kaydı bulunmuyor.</p>
                <p className="text-sm mt-1">Sağ üstten "Hayvan Ekle" butonunu kullanarak kurbanlıkları sisteme dahil edin.</p>
              </div>
          )}
      </div>

      {/* Yazdırma Esnasında Görünecek Temiz A4 Hayvan Listesi Tablosu */}
      <div className="hidden print:block w-full mt-4">
        <div className="border border-slate-300 rounded-[12px] overflow-hidden w-full text-black bg-white shadow-none">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-300">
                <th className="p-3 font-bold border-r border-slate-200 w-[12%] text-slate-700">Küpe No</th>
                <th className="p-3 font-bold border-r border-slate-200 w-[10%] text-slate-700">Tür</th>
                <th className="p-3 font-bold border-r border-slate-200 w-[16%] text-slate-700">Kilo Bilgisi</th>
                <th className="p-3 font-bold border-r border-slate-200 w-[12%] text-slate-700">Canlı Kg ₺</th>
                <th className="p-3 font-bold border-r border-slate-200 w-[12%] text-slate-700">Durum</th>
                <th className="p-3 font-bold w-[38%] text-slate-700">Hissedarlar ve Ödeme Durumu</th>
              </tr>
            </thead>
            <tbody>
              {animals.map((animal) => {
                const currentShares = animal.shares || []
                return (
                  <tr key={animal.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50/50">
                    <td className="p-3 font-bold border-r border-slate-200 text-slate-800">
                      <div className="flex flex-col gap-1">
                        <span>{animal.ear_tag || 'İsimsiz'}</span>
                        {animal.weight_group && (
                          <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 rounded w-max">
                            {animal.weight_group}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 border-r border-slate-200 font-semibold uppercase text-slate-700">
                      {animal.type === 'BUYUKBAS' ? 'Büyükbaş' : 'Küçükbaş'}
                    </td>
                    <td className="p-3 border-r border-slate-200 font-medium text-slate-700">
                      {animal.initial_weight || 0} KG → {animal.final_weight || 0} KG
                    </td>
                    <td className="p-3 border-r border-slate-200 font-semibold text-slate-800">
                      ₺{animal.price_per_kg || 0}
                    </td>
                    <td className="p-3 border-r border-slate-200 font-bold uppercase text-[10px] text-slate-700">
                      {animal.status === 'PENDING' && 'Bekliyor'}
                      {animal.status === 'SLAUGHTERED' && 'Kesildi'}
                      {animal.status === 'BUTCHERED' && 'Parçalandı'}
                      {animal.status === 'COMPLETED' && 'Dağıtıldı'}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {currentShares.map((share: any, idx: number) => {
                          const paymentLabel = share.payment_status === 'PAID' ? 'ÖDENDİ' : share.payment_status === 'PARTIAL' ? 'KISMİ' : 'ÖDENMEDİ';
                          return (
                            <div key={share.id} className="flex justify-between items-center text-[11px] border-b border-slate-100 last:border-0 pb-0.5">
                              <span className="font-semibold text-slate-800">
                                {idx + 1}. {share.donor_name} {share.reference_name ? `(${share.reference_name})` : ''}
                              </span>
                              <span className={`text-[9px] font-extrabold uppercase ${share.payment_status === 'PAID' ? 'text-emerald-600' : share.payment_status === 'PARTIAL' ? 'text-amber-500' : 'text-rose-500'}`}>
                                {paymentLabel}
                              </span>
                            </div>
                          )
                        })}
                        {currentShares.length === 0 && (
                          <span className="text-slate-400 font-medium italic">Henüz hissedar atanmamış.</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
