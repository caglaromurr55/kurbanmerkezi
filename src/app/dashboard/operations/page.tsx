import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { updateAnimalStatus, saveVideoUrl } from './actions'

export default async function OperationsPage() {
  const supabase = await createClient()
  const { data: activeCampaign } = await supabase.from('campaigns').select('id').eq('is_active', true).single()
  
  let animals: any[] = []
  if (activeCampaign) {
    const { data } = await supabase.from('animals')
      .select('*')
      .eq('campaign_id', activeCampaign.id)
      .order('created_at', { ascending: true })
    animals = data || []
  }

  const columns = [
    { id: 'PENDING', title: 'Bekliyor', next: 'SLAUGHTERING', btnText: 'Kesime Al' },
    { id: 'SLAUGHTERING', title: 'Kesiliyor', next: 'PROCESSING', btnText: 'Parçalamaya Geç' },
    { id: 'PROCESSING', title: 'İşleniyor', next: 'COMPLETED', btnText: 'Tamamlandı' },
    { id: 'COMPLETED', title: 'Tamamlandı', next: null, btnText: '' }
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
         <h1 className="text-2xl font-bold tracking-tight">Kesim Operasyonu</h1>
         <p className="text-muted-foreground">Kurbanlıkların operasyonel süreçlerini yönetin. İlgili aşamaya taşımak için butonları kullanın.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start overflow-x-auto pb-4">
        {columns.map(col => (
          <div key={col.id} className="flex flex-col gap-4 min-w-[280px] bg-slate-200/40 p-4 rounded-2xl border border-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
            <h2 className="font-bold text-sm px-1 py-1 flex justify-between tracking-wide text-slate-700 uppercase">
                {col.title}
                <span className="bg-white text-slate-800 px-2.5 py-0.5 rounded-full shadow-sm">
                    {animals.filter(a => a.status === col.id).length}
                </span>
            </h2>
            <div className="flex flex-col gap-3">
              {animals.filter(a => a.status === col.id).map(animal => (
                <Card key={animal.id} className="glass-card transition-all w-full border-none shadow-md hover:shadow-lg hover:-translate-y-0.5 duration-300">
                  <CardHeader className="p-4 pb-2 border-b border-slate-100/50 bg-white/40">
                    <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        {animal.ear_tag || 'İsimsiz'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col gap-3 bg-white/30">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Küpe Profili</span>
                      <div className="flex justify-between items-center text-sm font-medium text-slate-700">
                          <span>{animal.type === 'BUYUKBAS' ? 'Büyükbaş' : 'Küçükbaş'}</span>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-md">{animal.weight_group || '-'}</span>
                      </div>
                    </div>
                    {col.next && (
                      <form action={updateAnimalStatus} className="mt-1">
                        <input type="hidden" name="animal_id" value={animal.id} />
                        <input type="hidden" name="status" value={col.next} />
                        <Button type="submit" size="sm" className="w-full text-xs font-bold tracking-wide shadow-md" variant={col.id === 'PENDING' ? 'default' : 'outline'}>
                            {col.btnText}
                        </Button>
                      </form>
                    )}
                    {!col.next && (
                      <div className="mt-1 pt-3 border-t border-slate-200/50">
                          {animal.video_url ? (
                              <a href={animal.video_url} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full h-8 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors shadow-sm">
                                  Videoyu İzle
                              </a>
                          ) : (
                              <form action={saveVideoUrl} className="flex flex-col gap-2">
                                  <input type="hidden" name="animal_id" value={animal.id} />
                                  <input type="url" name="video_url" placeholder="URL yapiştir" className="flex h-8 w-full rounded-md border-0 ring-1 ring-slate-200 bg-white/60 px-3 py-1 text-xs shadow-inner transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" required />
                                  <Button type="submit" size="sm" variant="secondary" className="w-full text-xs font-bold shadow-sm">Bağla & Bildir</Button>
                              </form>
                          )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
