import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Globe, ArrowRight, TrendingUp, HandCoins } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardIndex() {
  const supabase = await createClient()
  const { data: activeCampaign } = await supabase.from('campaigns').select('id, name').eq('is_active', true).single()

  let totalRevenue = 0;
  let totalCost = 0;
  
  if (activeCampaign) {
    const { data: allShares } = await supabase.from('shares').select('sale_price, cost_price, exchange_rate').eq('campaign_id', activeCampaign.id)
    
    if (allShares) {
      allShares.forEach(s => {
        const saleTL = Number(s.sale_price || 0) * Number(s.exchange_rate || 1)
        const costTL = Number(s.cost_price || 0) * Number(s.exchange_rate || 1)
        
        totalRevenue += saleTL
        totalCost += costTL
      })
    }
  }

  const netProfit = totalRevenue - totalCost
  const formatCurrency = (val: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="flex flex-col gap-8 animate-fade-in py-10 items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-2xl flex flex-col gap-3 mb-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Kurban Operasyon Merkezi</h1>
        <p className="text-lg text-slate-500 font-medium">Lütfen işlem yapmak istediğiniz faliyet bölgesini seçin. Yurtiçi ve Yurtdışı listeleri ile finansal verileri birbirinden tamamen bağımsızdır.</p>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full max-w-2xl mb-4">
        {/* Toplam Ciro */}
        <Card className="glass-card border-emerald-200/50 bg-gradient-to-br from-white to-emerald-50/30 overflow-hidden relative">
          <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-emerald-500/10" />
          <CardHeader className="pb-2 relative z-10 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold text-slate-700">Genel Toplam Ciro</CardTitle>
            <HandCoins className="w-5 h-5 text-emerald-500 opacity-80" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Yurtiçi ve Yurtdışı Toplamı</p>
          </CardContent>
        </Card>

        {/* Toplam Kâr */}
        <Card className="glass-card border-indigo-200/50 bg-gradient-to-br from-white to-indigo-50/30 overflow-hidden relative">
          <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-indigo-500/10" />
          <CardHeader className="pb-2 relative z-10 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold text-slate-700">Genel Toplam Kâr</CardTitle>
            <TrendingUp className="w-5 h-5 text-indigo-500 opacity-80" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-extrabold text-indigo-700 tracking-tight">{formatCurrency(netProfit)}</div>
            <p className="text-xs text-indigo-600/70 mt-1 font-medium">Güncel Ciro - Toplam Maliyet</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl px-4">
        <Link href="/dashboard/yurtici" className="block group">
          <Card className="glass-card h-full transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl border-emerald-200/50 hover:border-emerald-400/50 bg-gradient-to-br from-white to-emerald-50/30 overflow-hidden relative cursor-pointer">
            <div className="absolute right-0 top-0 h-40 w-40 -translate-y-12 translate-x-12 rounded-full bg-emerald-500/10 transition-transform duration-700 group-hover:scale-[2.5]" />
            <CardContent className="p-8 flex flex-col items-center text-center gap-6 h-full relative z-10">
              <div className="bg-emerald-100 p-5 rounded-3xl group-hover:bg-emerald-500 transition-colors duration-500 shadow-inner">
                <MapPin className="w-12 h-12 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                 <h2 className="text-2xl font-bold text-slate-800">Yurtiçi Kurban Satışı</h2>
                 <p className="text-slate-500 font-medium leading-relaxed">
                   Büyükbaş hisse ve bağış yönetimleri, hayvan eşleştirmeleri, kesim operasyon takibi ve yurtiçi kâr/zarar panosu.
                 </p>
              </div>
              <div className="mt-auto pt-6 flex items-center text-emerald-600 font-bold tracking-wide">
                 Yurtiçi Panele Git <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/yurtdisi" className="block group">
          <Card className="glass-card h-full transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl border-blue-200/50 hover:border-blue-400/50 bg-gradient-to-br from-white to-blue-50/30 overflow-hidden relative cursor-pointer">
            <div className="absolute right-0 top-0 h-40 w-40 -translate-y-12 translate-x-12 rounded-full bg-blue-500/10 transition-transform duration-700 group-hover:scale-[2.5]" />
            <CardContent className="p-8 flex flex-col items-center text-center gap-6 h-full relative z-10">
               <div className="bg-blue-100 p-5 rounded-3xl group-hover:bg-blue-500 transition-colors duration-500 shadow-inner">
                <Globe className="w-12 h-12 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                 <h2 className="text-2xl font-bold text-slate-800">Yurtdışı Kurban & Bağış</h2>
                 <p className="text-slate-500 font-medium leading-relaxed">
                   Döviz kurlu standart yurtdışı bağışları, adak ve akika kurbanları. Yurtdışı listeleri ve kâr/zarar panosu.
                 </p>
              </div>
              <div className="mt-auto pt-6 flex items-center text-blue-600 font-bold tracking-wide">
                 Yurtdışı Panele Git <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
