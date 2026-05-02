import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Beef, Globe, CheckCircle2, Clock, Tag, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export default async function LandingPage() {
  const supabase = await createClient()
  
  const { data: activeCampaign } = await supabase.from('campaigns').select('id, name').eq('is_active', true).single()
  
  let animals: any[] = []
  let yurtdisiShares: any[] = []

  if (activeCampaign) {
    const { data: aData } = await supabase.from('animals').select('*, shares(*)').eq('campaign_id', activeCampaign.id).eq('region', 'YURTICI').order('created_at', { ascending: false })
    animals = aData || []

    const { data: sData } = await supabase.from('shares').select('*').eq('campaign_id', activeCampaign.id).eq('region', 'YURTDISI').order('created_at', { ascending: false })
    yurtdisiShares = sData || []
  }

  // İsim gizliliği istenmediği için doğrudan ismi döndürüyoruz.

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm p-1 border border-slate-200">
            <img src="/logo.png" alt="Logo" className="object-contain w-full h-full" />
          </div>
          <span className="text-lg font-extrabold text-slate-800 tracking-tight hidden sm:inline-block">Kurban Merkezi</span>
        </div>
        <Link href="/login">
          <Button variant="outline" className="shadow-sm border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 font-bold">
            <Lock className="w-4 h-4 mr-2" />
            Yönetici Girişi
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            {activeCampaign ? activeCampaign.name : 'Güncel Organizasyon Bulunamadı'}
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Kurban bağışlarınızı ve hisse atamalarınızı şeffaf bir şekilde bu sayfadan takip edebilirsiniz.
          </p>
        </div>

        {activeCampaign ? (
          <Tabs defaultValue="yurtici" className="w-full">
            <TabsList className="bg-slate-200/50 p-1 border border-slate-200/60 rounded-2xl w-full max-w-md mx-auto flex h-auto mb-8 shadow-sm">
              <TabsTrigger value="yurtici" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 px-6 py-3 font-bold text-base flex-1">
                Yurtiçi Kurbanlar
              </TabsTrigger>
              <TabsTrigger value="yurtdisi" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 px-6 py-3 font-bold text-base flex-1">
                Yurtdışı Bağışlar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="yurtici" className="mt-2 animate-slide-up">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {animals.map((animal) => (
                  <Card key={animal.id} className="glass-card overflow-hidden hover:shadow-2xl transition-shadow border-slate-200/60 rounded-[20px]">
                    <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-3 pt-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                          <Tag className="w-5 h-5 text-emerald-500" />
                          {animal.ear_tag || 'İsimsiz'}
                          {animal.weight_group && (
                            <Badge variant="outline" className="ml-1 bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                              {animal.weight_group}
                            </Badge>
                          )}
                        </CardTitle>
                        {animal.status === 'COMPLETED' ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1"/> Tamamlandı</Badge>
                        ) : animal.status === 'SLAUGHTERED' || animal.status === 'BUTCHERED' ? (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1"/> Kesildi</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 shadow-none"><Clock className="w-3 h-3 mr-1"/> Bekliyor</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 pb-5 px-5">
                      <div className="flex justify-between text-xs text-slate-500 font-semibold mb-3">
                        <span className="uppercase tracking-wider">Hissedarlar ({animal.shares?.length || 0}/{animal.share_capacity || 7})</span>
                      </div>
                      <div className="space-y-2">
                        {animal.shares && animal.shares.length > 0 ? (
                          animal.shares.map((share: any, idx: number) => (
                            <div key={share.id} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
                                {idx + 1}
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <span className="font-bold text-slate-700 text-sm truncate">{share.donor_name || 'İsimsiz'}</span>
                                {share.reference_name && <span className="text-[10px] text-slate-400 font-semibold truncate">{share.reference_name}</span>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-slate-400 text-sm font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            Henüz hissedar atanmamış
                          </div>
                        )}
                        
                        {/* Boş hisse yerlerini göster */}
                        {Array.from({ length: Math.max(0, (animal.share_capacity || 7) - (animal.shares?.length || 0)) }).map((_, i) => (
                          <div key={`empty-${i}`} className="flex items-center gap-3 bg-slate-50/50 p-2.5 rounded-xl border border-dashed border-slate-200">
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold shrink-0">
                              {(animal.shares?.length || 0) + i + 1}
                            </div>
                            <span className="font-semibold text-slate-400 text-sm">Boş Hisse</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {animals.length === 0 && (
                  <div className="col-span-full text-center py-12 text-slate-500 font-medium bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                    Bu organizasyonda henüz yurtiçi kurbanlık bulunmuyor.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="yurtdisi" className="mt-2 animate-slide-up">
              <div className="bg-white rounded-[20px] shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                  <Globe className="w-6 h-6 text-blue-500" />
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-800">Yurtdışı Bağış Listesi</h2>
                    <p className="text-sm text-slate-500 font-medium">Bağışlarınız ilgili bölgelere ulaştırılmak üzere kaydedilmiştir.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 bg-slate-50/30">
                  {yurtdisiShares.map((share, idx) => (
                    <div key={share.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 hover:border-blue-200 transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 shadow-none text-[10px]">
                          Yurtdışı
                        </Badge>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-slate-800">{share.donor_name || 'İsimsiz'}</span>
                        <span className="text-xs text-slate-500 font-medium mt-1">Bağış Tarihi: {new Date(share.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  ))}
                  {yurtdisiShares.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 font-medium">
                      Henüz yurtdışı bağış kaydı bulunmuyor.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-20 text-slate-500 font-medium bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <Beef className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            Şu anda aktif bir kurban organizasyonu bulunmamaktadır.
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm font-medium border-t border-slate-200/60 bg-white mt-auto">
        © 2026 Kurban Merkezi Organizasyon Yönetimi. Tüm hakları saklıdır.
      </footer>
    </div>
  )
}
