import { createAdminClient } from '@/utils/supabase/admin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Beef, Globe, CheckCircle2, Clock, Tag, Lock, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export const revalidate = 10 // Canlı takip verilerini 10 saniyede bir yenile

export default async function LandingPage() {
  const adminClient = createAdminClient()
  
  // Aktif kampanyayı çek
  const { data: activeCampaign, error: campaignError } = await adminClient
    .from('campaigns')
    .select('id, name, tenants(name)')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()
  
  let animals: any[] = []
  let yurticiShares: any[] = []
  let yurtdisiShares: any[] = []
  let errorState = false

  try {
    if (activeCampaign) {
      // 1. Yurtiçi Kurbanlıklar (Hisseleriyle Birlikte)
      const { data: aData } = await adminClient
        .from('animals')
        .select('*, shares(*)')
        .eq('campaign_id', activeCampaign.id)
        .eq('region', 'YURTICI')
        .order('created_at', { ascending: false })
      animals = aData || []

      // 2. Yurtiçi Bağışlar (Henüz kurbana atanmamış / Havuzdaki flat listeler)
      const { data: yiShares } = await adminClient
        .from('shares')
        .select('*')
        .eq('campaign_id', activeCampaign.id)
        .eq('region', 'YURTICI')
        .is('animal_id', null)
        .order('created_at', { ascending: false })
      yurticiShares = yiShares || []

      // 3. Yurtdışı Hisseler (Flat liste halinde)
      const { data: sData } = await adminClient
        .from('shares')
        .select('*')
        .eq('campaign_id', activeCampaign.id)
        .eq('region', 'YURTDISI')
        .order('created_at', { ascending: false })
      yurtdisiShares = sData || []
    }
  } catch (err) {
    console.error('Error loading public view:', err)
    errorState = true
  }

  const tenantName = (Array.isArray(activeCampaign?.tenants) ? activeCampaign?.tenants[0]?.name : (activeCampaign?.tenants as any)?.name) || 'Kurban Merkezi'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between border-b bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm p-1 border border-slate-200">
            <img src="/logo.png" alt="Logo" className="object-contain w-full h-full" />
          </div>
          <span className="text-lg font-extrabold text-slate-800 tracking-tight hidden sm:inline-block">
            {tenantName} Canlı Takip
          </span>
          <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white text-[10px] font-extrabold border-0 animate-pulse tracking-wide ml-1">CANLI</Badge>
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
          <Badge className="bg-blue-50 border border-blue-100 text-blue-700 font-bold text-[10px] uppercase px-3 py-1 mb-3 rounded-full tracking-wider">
            ŞEFFAF KURBAN OPERASYONLARI
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            {activeCampaign ? activeCampaign.name : 'Güncel Organizasyon Bulunamadı'}
          </h1>
          <p className="text-base sm:text-lg text-slate-500 font-semibold leading-relaxed">
            Kurban bağışlarınızı, hisselerinizi ve canlı operasyon durumlarını anlık olarak bu ekrandan takip edebilirsiniz.
          </p>
        </div>

        {errorState ? (
          <div className="text-center py-20 text-red-500 font-semibold bg-white rounded-3xl border border-red-100 shadow-sm max-w-xl mx-auto">
            Canlı takip verileri yüklenirken bir bağlantı hatası oluştu. Lütfen sayfayı yenilemeyi deneyin.
          </div>
        ) : activeCampaign ? (
          <Tabs defaultValue="yurtici" className="w-full">
            <TabsList className="bg-slate-200/50 p-1 border border-slate-200/60 rounded-2xl w-full max-w-2xl mx-auto flex h-auto mb-8 shadow-sm">
              <TabsTrigger value="yurtici" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 px-4 py-3 font-bold text-sm sm:text-base flex-1">
                Yurtiçi Kurbanlar
              </TabsTrigger>
              <TabsTrigger value="yurtici_bagis" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-amber-700 px-4 py-3 font-bold text-sm sm:text-base flex-1">
                Yurtiçi Bağış Havuzu
              </TabsTrigger>
              <TabsTrigger value="yurtdisi" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 px-4 py-3 font-bold text-sm sm:text-base flex-1">
                Yurtdışı Bağışlar
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: YURTİÇİ KURBANLAR (HAYVANLAR & EŞLEŞEN HİSSEDARLAR) */}
            <TabsContent value="yurtici" className="mt-2 animate-slide-up">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {animals.map((animal) => (
                  <Card key={animal.id} className="glass-card overflow-hidden hover:shadow-2xl transition-shadow border-slate-200/60 rounded-[20px] bg-white">
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
                      <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">
                        <span>Hissedarlar ({animal.shares?.length || 0}/{animal.share_capacity || 7})</span>
                        {animal.shares && animal.shares.length > 0 && <span className="text-slate-400">({animal.type === 'BUYUKBAS' ? 'Büyükbaş' : 'Küçükbaş'})</span>}
                      </div>
                      <div className="space-y-2">
                        {animal.shares && animal.shares.length > 0 ? (
                          animal.shares.map((share: any, idx: number) => (
                            <div key={share.id} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
                                {idx + 1}
                              </div>
                              <div className="flex flex-col overflow-hidden w-full">
                                <div className="flex items-center justify-between gap-1 w-full">
                                  <span className="font-extrabold text-slate-700 text-sm truncate">{share.donor_name || 'İsimsiz'}</span>
                                  {share.reference_name && (
                                    <Badge variant="outline" className="text-[9px] font-bold border-blue-100 bg-blue-50 text-blue-700 shrink-0 uppercase tracking-wide">
                                      Ref: {share.reference_name}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-slate-400 text-sm font-semibold bg-slate-50 rounded-xl border border-dashed border-slate-200">
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

            {/* TAB 2: YURTİÇİ BAĞIŞLAR (FLAT HAVUZ LİSTESİ) */}
            <TabsContent value="yurtici_bagis" className="mt-2 animate-slide-up">
              <div className="bg-white rounded-[20px] shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                  <Beef className="w-6 h-6 text-amber-500" />
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-800">Yurtiçi Bağış & Adak Havuzu</h2>
                    <p className="text-sm text-slate-500 font-medium">Hayvan eşleştirmesi bekleyen veya doğrudan adak/bağış olarak kaydedilmiş yurtiçi bağışçılarımız.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 bg-slate-50/30">
                  {yurticiShares.map((share, idx) => (
                    <div key={share.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 hover:border-amber-200 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 shadow-none text-[10px] font-bold">
                          Yurtiçi
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="font-extrabold text-slate-800 text-sm truncate">{share.donor_name || 'İsimsiz'}</span>
                        {share.reference_name && (
                          <Badge variant="outline" className="text-[9px] py-0.5 px-2 border-blue-100 bg-blue-50 text-blue-700 font-bold tracking-wide w-max uppercase truncate">
                            Ref: {share.reference_name}
                          </Badge>
                        )}
                        <span className="text-[10px] text-slate-400 font-semibold mt-1">Bağış Tarihi: {new Date(share.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  ))}
                  {yurticiShares.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 font-semibold bg-white rounded-xl">
                      Eşleşme havuzunda bekleyen yurtiçi bağış kaydı bulunmuyor.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: YURTDIŞI BAĞIŞLAR (FLAT LİSTE) */}
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
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 shadow-none text-[10px] font-bold">
                          Yurtdışı
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="font-extrabold text-slate-800 text-sm truncate">{share.donor_name || 'İsimsiz'}</span>
                        {share.reference_name && (
                          <Badge variant="outline" className="text-[9px] py-0.5 px-2 border-blue-100 bg-blue-50 text-blue-700 font-bold tracking-wide w-max uppercase truncate">
                            Ref: {share.reference_name}
                          </Badge>
                        )}
                        <span className="text-[10px] text-slate-400 font-semibold mt-1">Bağış Tarihi: {new Date(share.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  ))}
                  {yurtdisiShares.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 font-semibold bg-white rounded-xl">
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
        © 2026 {tenantName} Organizasyon Yönetimi. Tüm hakları saklıdır.
      </footer>
    </div>
  )
}
