import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Beef, Users, CheckCircle2, TrendingUp, HandCoins, ArrowRight, ArrowRightCircle, Clock, Scissors, Tag } from 'lucide-react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function YurticiDashboardPage() {
  const supabase = await createClient()
  const { data: activeCampaign } = await supabase.from('campaigns').select('id, name').eq('is_active', true).single()

  let animalCount = 0
  let shareCount = 0
  let completedCount = 0
  
  let totalRevenue = 0
  let totalCost = 0
  let pendingRevenue = 0

  if (activeCampaign) {
    // Sadece Yurtiçi verileri
    const { count: aCount } = await supabase.from('animals').select('*', { count: 'exact', head: true }).eq('campaign_id', activeCampaign.id).eq('region', 'YURTICI')
    const { count: sCount } = await supabase.from('shares').select('*', { count: 'exact', head: true }).eq('campaign_id', activeCampaign.id).eq('region', 'YURTICI')
    const { count: cCount } = await supabase.from('animals').select('*', { count: 'exact', head: true }).eq('campaign_id', activeCampaign.id).eq('region', 'YURTICI').eq('status', 'COMPLETED')
    
    animalCount = aCount || 0
    shareCount = sCount || 0
    completedCount = cCount || 0

    // Finansal Veriler (Sadece Yurtiçi)
    const { data: allShares } = await supabase.from('shares').select('sale_price, cost_price, exchange_rate, payment_status, region').eq('campaign_id', activeCampaign.id).eq('region', 'YURTICI')
    
    if (allShares) {
      allShares.forEach(s => {
        const saleTL = Number(s.sale_price || 0) * Number(s.exchange_rate || 1)
        const costTL = Number(s.cost_price || 0) * Number(s.exchange_rate || 1)
        
        totalRevenue += saleTL
        totalCost += costTL

        if (s.payment_status === 'PENDING') pendingRevenue += saleTL
        if (s.payment_status === 'PARTIAL') pendingRevenue += (saleTL / 2) // Tahmini
      })
    }
  }

  // Canli operasyon verisi icin son eklenen 10 hayvan
  const { data: recentAnimals } = activeCampaign ? await supabase.from('animals').select('id, ear_tag, type, status, share_capacity, created_at, initial_weight, final_weight, price_per_kg').eq('campaign_id', activeCampaign.id).eq('region', 'YURTICI').order('created_at', { ascending: false }).limit(10) : { data: [] }

  const netProfit = totalRevenue - totalCost
  const formatCurrency = (val: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="flex flex-col gap-8 animate-fade-in py-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-3">Yurtiçi Operasyon Panosu</h1>
        <p className="text-slate-500 font-medium pl-4">
          {activeCampaign ? `'${activeCampaign.name}' dönemi yurtiçi kestiğimiz kurbanlar ve hisseler.` : 'Sistemde aktif bir dönem bulunmuyor.'}
        </p>
      </div>

      {/* Hızlı Erişim Menüsü */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/animals" className="block group">
           <Card className="glass-card h-full transition-all hover:scale-[1.02] border-slate-200">
             <CardHeader className="pb-2">
               <CardTitle className="text-lg flex items-center gap-2 text-slate-800"><Beef className="text-emerald-500" /> Hayvan Listesi</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-sm text-slate-500 mb-4">Sisteme kaydedilmiş kurbanlıkları (Büyükbaş/Küçükbaş) görün, düzenleyin, hisse ekleyin.</p>
                <div className="text-sm font-bold text-emerald-600 flex items-center">Görüntüle <ArrowRightCircle className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></div>
             </CardContent>
           </Card>
        </Link>

        <Link href="/dashboard/shares" className="block group">
           <Card className="glass-card h-full transition-all hover:scale-[1.02] border-slate-200">
             <CardHeader className="pb-2">
               <CardTitle className="text-lg flex items-center gap-2 text-slate-800"><Users className="text-blue-500" /> Hisse Sahipleri</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-sm text-slate-500 mb-4">Küçükbaş ve Büyükbaş hissedarlarının tümünün finansal dökümü ve ödeme takipleri.</p>
                <div className="text-sm font-bold text-blue-600 flex items-center">Görüntüle <ArrowRightCircle className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></div>
             </CardContent>
           </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
        {/* İstatistikler */}
        <Card className="glass-card border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Toplam Hayvan / Hisse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">{animalCount} <span className="text-lg text-slate-400 font-medium">/ {shareCount} Kişi</span></div>
            <p className="text-xs text-slate-500 mt-2">Kayıtlı kurbanlıklar ve hissedarlar.</p>
          </CardContent>
        </Card>

        {/* Kesimi Tamamlanan */}
        <Card className="glass-card border-slate-200/60 bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Kesimi Tamamlanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600">{completedCount} <span className="text-lg text-slate-400 font-medium">Hayvan</span></div>
            <p className="text-xs text-slate-500 mt-2">Dağıtımı bitmiş, operasyonu sonlanmış olanlar.</p>
          </CardContent>
        </Card>

        {/* Ciro */}
        <Card className="glass-card border-emerald-200/50 bg-gradient-to-br from-white to-emerald-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-700">Yurtiçi Ciro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Tahmini yurtiçi satışı tabanlı gelir.</p>
          </CardContent>
        </Card>

        {/* Kâr */}
        <Card className="glass-card border-indigo-200/50 bg-gradient-to-br from-white to-indigo-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-700">Yurtiçi Kâr / Alacak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-indigo-700 tracking-tight">{formatCurrency(netProfit)}</div>
            <p className="text-xs text-rose-500 mt-2 font-medium font-bold">Bekleyen Ödeme: {formatCurrency(pendingRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Canlı Operasyon Tablosu */}
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 mt-4 px-2">Canlı Operasyon Tablosu (Son Eklenenler)</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-x-auto w-full">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600 py-3">Küpe Numarası</TableHead>
              <TableHead className="font-semibold text-slate-600 py-3">Tür</TableHead>
              <TableHead className="font-semibold text-slate-600 py-3">İlk Kilo</TableHead>
              <TableHead className="font-semibold text-slate-600 py-3">Son Karkas</TableHead>
              <TableHead className="font-semibold text-slate-600 py-3 text-right">Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentAnimals?.length ? recentAnimals.map((animal) => (
               <TableRow key={animal.id} className="hover:bg-slate-50/50 transition-colors group">
                 <TableCell className="font-bold text-slate-800 flex items-center gap-2"><Tag className="w-4 h-4 text-slate-400"/> {animal.ear_tag}</TableCell>
                 <TableCell><span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold tracking-wider uppercase ${animal.type === 'BUYUKBAS' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>{animal.type === 'BUYUKBAS' ? 'Büyükbaş' : 'Küçükbaş'}</span></TableCell>
                 <TableCell className="text-slate-600 font-medium">{animal.initial_weight || 0} KG</TableCell>
                 <TableCell className="text-emerald-700 font-bold">{animal.final_weight || '-'} KG</TableCell>
                 <TableCell className="text-right">
                    {animal.status === 'PENDING' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-widest"><Clock className="w-3.5 h-3.5"/> Bekliyor</span>}
                    {animal.status === 'SLAUGHTERED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold uppercase tracking-widest"><Scissors className="w-3.5 h-3.5"/> Kesildi</span>}
                    {animal.status === 'BUTCHERED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 border border-orange-100 text-orange-600 text-[11px] font-bold uppercase tracking-widest"><Scissors className="w-3.5 h-3.5"/> Parçalandı</span>}
                    {animal.status === 'COMPLETED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-bold uppercase tracking-widest"><CheckCircle2 className="w-3.5 h-3.5"/> Dağıtıldı</span>}
                 </TableCell>
               </TableRow>
            )) : (
               <TableRow><TableCell colSpan={5} className="text-center py-6 text-slate-500 font-medium">Henüz kayıtlı canlı operasyon yok.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
