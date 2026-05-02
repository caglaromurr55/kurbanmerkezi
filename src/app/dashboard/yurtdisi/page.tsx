import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, Users, TrendingUp, HandCoins, Beef } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AddShareDialog } from '@/app/dashboard/shares/add-share-dialog'
import { EditShareDialog } from '@/app/dashboard/animals/edit-share-dialog'
import { YurtdisiSettingsDialog } from './yurtdisi-settings-dialog'
import { AddPaymentDialog } from '@/app/dashboard/shares/add-payment-dialog'
import { ListFilters } from '@/components/list-filters'
import { ExportExcelButton } from '@/components/export-excel-button'

function SharesTable({ shares }: { shares: any[] }) {
  return (
    <div className="w-full mt-6">
      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {shares.map((share) => (
          <div key={share.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex flex-col gap-3 relative overflow-hidden">
            <div className="flex justify-between items-start pr-4">
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-800 text-base">{share.donor_name}</span>
                <span className="text-slate-500 font-medium text-xs mt-0.5">{share.donor_phone}</span>
              </div>
              <div className="flex gap-1 absolute top-3 right-3">
                 <AddPaymentDialog share={share} />
                 <EditShareDialog share={share} />
              </div>
            </div>

            <div>
              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-[11px] font-bold w-max">
                {share.share_type === 'BAGIS' ? 'Yurtdışı Bağış' : share.share_type}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
               <div className="flex justify-between text-xs">
                 <span className="text-slate-500 font-medium">Satış Tutarı:</span>
                 <span className="font-bold text-slate-700">{share.sale_price || 0} {share.currency}</span>
               </div>
               <div className="flex justify-between text-xs">
                 <span className="text-slate-500 font-medium">Ödenen:</span>
                 <span className="font-bold text-emerald-600">{share.total_paid || 0} {share.currency}</span>
               </div>
               <div className="flex justify-between text-xs border-t border-slate-200 pt-2 mt-0.5">
                 <span className="text-slate-500 font-medium">Kalan Bakiye:</span>
                 <span className={`font-bold ${(Number(share.sale_price || 0) - Number(share.total_paid || 0)) > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    {Math.max(0, Number(share.sale_price || 0) - Number(share.total_paid || 0))} {share.currency}
                 </span>
               </div>
               <div className="mt-1 flex justify-end">
                 {share.payment_status === 'PAID' && <span className="text-[10px] text-emerald-600 font-extrabold uppercase bg-emerald-100 px-2 py-0.5 rounded-full">ÖDENDİ</span>}
                 {share.payment_status === 'PARTIAL' && <span className="text-[10px] text-amber-600 font-extrabold uppercase bg-amber-100 px-2 py-0.5 rounded-full">KISMİ ÖDENDİ</span>}
                 {share.payment_status === 'PENDING' && <span className="text-[10px] text-rose-500 font-extrabold uppercase bg-rose-100 px-2 py-0.5 rounded-full">ÖDENMEDİ</span>}
               </div>
            </div>
            
            <div className="absolute top-0 left-0 w-1 h-full">
              {share.payment_status === 'PAID' && <div className="w-full h-full bg-emerald-500"></div>}
              {share.payment_status === 'PARTIAL' && <div className="w-full h-full bg-amber-500"></div>}
              {share.payment_status === 'PENDING' && <div className="w-full h-full bg-rose-500"></div>}
            </div>
          </div>
        ))}
        {shares.length === 0 && (
           <div className="text-center py-8 text-slate-400 font-medium bg-white rounded-xl border border-slate-100">
             Bu bölgede henüz işlem bulunmuyor.
           </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block glass-card rounded-[20px] overflow-hidden border border-slate-200/50">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-slate-700">Bağışçı Adı</TableHead>
              <TableHead className="font-bold text-slate-700">Telefon</TableHead>
              <TableHead className="font-bold text-slate-700">Bağış Tipi</TableHead>
              <TableHead className="font-bold text-slate-700">Bakiye & Durum</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shares.map((share) => (
              <TableRow key={share.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                <TableCell className="font-semibold text-slate-800 group-hover:text-primary transition-colors">
                  {share.donor_name}
                </TableCell>
                <TableCell className="text-slate-500 font-medium tracking-wide">
                  {share.donor_phone}
                </TableCell>
                <TableCell>
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-[11px] font-bold">
                      {share.share_type === 'BAGIS' ? 'Yurtdışı Bağış' : share.share_type}
                    </span>
                </TableCell>
                <TableCell className="w-[180px]">
                    <div className="flex flex-col gap-1 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-slate-500 font-medium">Satış Tutarı:</span>
                           <span className="font-bold text-slate-700">{share.sale_price || 0} {share.currency}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-slate-500 font-medium">Ödenen:</span>
                           <span className="font-bold text-emerald-600">{share.total_paid || 0} {share.currency}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs border-t border-slate-200 pt-1 mt-0.5">
                           <span className="text-slate-500 font-medium">Kalan Bakiye:</span>
                           <span className={`font-bold ${(Number(share.sale_price || 0) - Number(share.total_paid || 0)) > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                              {Math.max(0, Number(share.sale_price || 0) - Number(share.total_paid || 0))} {share.currency}
                           </span>
                        </div>
                        <div className="mt-1 flex justify-end">
                          {share.payment_status === 'PAID' && <span className="text-[10px] text-emerald-600 font-extrabold uppercase bg-emerald-100 px-2 py-0.5 rounded-full">ÖDENDİ</span>}
                          {share.payment_status === 'PARTIAL' && <span className="text-[10px] text-amber-600 font-extrabold uppercase bg-amber-100 px-2 py-0.5 rounded-full">KISMİ ÖDENDİ</span>}
                          {share.payment_status === 'PENDING' && <span className="text-[10px] text-rose-500 font-extrabold uppercase bg-rose-100 px-2 py-0.5 rounded-full">ÖDENMEDİ</span>}
                        </div>
                    </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                      <AddPaymentDialog share={share} />
                      <EditShareDialog share={share} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {shares.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-medium">
                  Bu bölgede henüz işlem bulunmuyor.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default async function YurtdisiDashboardPage(props: { searchParams?: Promise<{ [key: string]: string | undefined }> }) {
  const supabase = await createClient()
  const searchParams = await props.searchParams
  const q = searchParams?.q?.toLowerCase() || ''
  const typeFilter = searchParams?.type || 'ALL'
  const statusFilter = searchParams?.status || 'ALL'

  const { data: activeCampaign } = await supabase.from('campaigns').select('id, name').eq('is_active', true).single()

  let shareCount = 0
  let totalRevenue = 0
  let totalCost = 0
  let pendingRevenue = 0
  let yurtdisiShares: any[] = []
  
  let defIntPrice = 0
  let defIntSalePriceTl = 0
  let usdRate = 34.0
  let allSettings = null

  if (activeCampaign) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
       const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
       const { data: set } = await supabase.from('tenant_settings').select('*').eq('tenant_id', ud?.tenant_id).single()
       if (set) {
         allSettings = set
         defIntPrice = set.default_international_price || 0
         defIntSalePriceTl = set.default_international_sale_price_tl || 0
         usdRate = set.fixed_usd_rate
         // Eger kur sabit degilse canli kur cek
         if (!set.fix_exchange_rate) {
           try {
             const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
             const d = await res.json()
             usdRate = d.rates.TRY
           } catch(e) {}
         }
       }
    }

    // Sadece Yurtdışı Verileri
    const { data: sData, count: sCount } = await supabase.from('shares').select('*, animals(ear_tag)', { count: 'exact' }).eq('campaign_id', activeCampaign.id).eq('region', 'YURTDISI').order('created_at', { ascending: false })

    shareCount = sCount || 0
    let filteredData = sData || []

    // Filtering logic
    if (q) {
      filteredData = filteredData.filter(s => 
        (s.donor_name && s.donor_name.toLowerCase().includes(q)) || 
        (s.donor_phone && s.donor_phone.toLowerCase().includes(q)) ||
        (s.reference_name && s.reference_name.toLowerCase().includes(q))
      )
    }
    if (typeFilter !== 'ALL') {
       filteredData = filteredData.filter(s => s.share_type === typeFilter)
    }
    if (statusFilter !== 'ALL') {
       filteredData = filteredData.filter(s => s.payment_status === statusFilter)
    }

    yurtdisiShares = filteredData

    yurtdisiShares.forEach(s => {
      const saleTL = Number(s.sale_price || 0) * Number(s.exchange_rate || 1)
      
      totalRevenue += saleTL

      if (s.payment_status === 'PENDING') pendingRevenue += saleTL
      if (s.payment_status === 'PARTIAL') pendingRevenue += (saleTL / 2)
    })

    // Maliyet Verileri (Sadece Yurtdışı)
    const { data: aData } = await supabase.from('animals').select('final_weight, initial_weight, price_per_kg').eq('campaign_id', activeCampaign.id).eq('region', 'YURTDISI')
    if (aData) {
      aData.forEach(a => {
        const weight = a.final_weight || a.initial_weight || 0
        totalCost += weight * (a.price_per_kg || 0)
      })
    }
  }

  const netProfit = totalRevenue - totalCost
  const formatCurrency = (val: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="flex flex-col gap-8 animate-fade-in py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 border-l-4 border-blue-500 pl-3">Yurtdışı Bağış Panosu</h1>
            <p className="text-slate-500 font-medium pl-4">
              {activeCampaign ? `'${activeCampaign.name}' dönemi yurtdışı bağış ve kurban işlemleri.` : 'Sistemde aktif bir dönem bulunmuyor.'}
            </p>
          </div>
          {activeCampaign && (
            <div className="flex-shrink-0 flex items-center gap-2 flex-wrap">
               <ExportExcelButton data={yurtdisiShares} filename="yurtdisi_satis_raporu.csv" />
               <Link href="/dashboard/yurtdisi/animals">
                 <Button variant="outline" className="text-slate-600 font-semibold shadow-sm border-slate-200 bg-white">
                   <Beef className="mr-2 h-4 w-4" /> Hayvan Listesi
                 </Button>
               </Link>
               <YurtdisiSettingsDialog settings={allSettings} />
               <AddShareDialog campaignId={activeCampaign.id} animals={[]} defaultInternationalPrice={defIntPrice} defaultInternationalSalePriceTl={defIntSalePriceTl} fixedUsdRate={usdRate} defaultRegion="YURTDISI" />
            </div>
          )}
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* İstatistikler */}
        <Card className="glass-card border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Toplam Bağışçı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
               {shareCount} <Users className="w-6 h-6 text-blue-500 opacity-50" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Dövizli ve yerel yurtdışı bağışları.</p>
          </CardContent>
        </Card>

        {/* Ciro */}
        <Card className="glass-card border-blue-200/50 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-700">Yurtdışı Ciro (Sabit Kur)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Dövizden TL'ye çevrilen brüt satış.</p>
          </CardContent>
        </Card>

        {/* Tahsilat */}
        <Card className="glass-card border-rose-200/50 bg-gradient-to-br from-white to-rose-50/30">
          <CardHeader className="pb-2">
             <CardTitle className="text-sm font-bold text-slate-700">Açık Hesap / Bekleyen</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-extrabold text-rose-600 tracking-tight">{formatCurrency(pendingRevenue)}</div>
             <p className="text-xs text-slate-500 mt-2 font-medium border-t border-rose-100 pt-1">Tahsil edilmeyen bağışlar.</p>
          </CardContent>
        </Card>

        {/* Kâr */}
        <Card className="glass-card border-indigo-200/50 bg-gradient-to-br from-white to-indigo-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-700">Yurtdışı Brüt Kâr</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-indigo-700 tracking-tight">{formatCurrency(netProfit)}</div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Toplam kazanç - döviz bazlı maliyet.</p>
          </CardContent>
        </Card>
      </div>

      <div>
         <h2 className="text-xl font-bold tracking-tight text-slate-800 mt-4 border-b border-slate-200 pb-2 flex items-center gap-2">
             <Globe className="w-5 h-5 text-blue-500" />
             Tüm Yurtdışı İşlemleri
         </h2>
         <ListFilters showTypes={false} />
         <SharesTable shares={yurtdisiShares} />
      </div>
    </div>
  )
}
