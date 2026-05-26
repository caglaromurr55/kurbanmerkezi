import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, Users, TrendingUp, HandCoins, Beef, ChevronLeft, ChevronRight, ArrowRightLeft } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AddShareDialog } from '@/app/dashboard/shares/add-share-dialog'
import { BatchAddShareDialog } from '@/app/dashboard/shares/batch-add-share-dialog'
import { EditShareDialog } from '@/app/dashboard/animals/edit-share-dialog'
import { YurtdisiSettingsDialog } from './yurtdisi-settings-dialog'
import { AddPaymentDialog } from '@/app/dashboard/shares/add-payment-dialog'
import { ListFilters } from '@/components/list-filters'
import { ExcelSharesExportButton } from './excel-shares-export-button'

function SharesTable({ shares, currentPage, path = '/dashboard/yurtdisi' }: { shares: any[], currentPage: number, path?: string }) {
  const limit = 25
  const offset = (currentPage - 1) * limit
  const totalCount = shares.length
  const totalPages = Math.max(1, Math.ceil(totalCount / limit))
  const paginatedShares = shares.slice(offset, offset + limit)

  return (
    <div className="space-y-4 mt-6">
      <div className="glass-card rounded-[20px] overflow-x-auto w-full">
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
            {paginatedShares.map((share) => (
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

      {/* Sayfalama Kontrolleri */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 px-2">
          <div className="text-xs text-slate-500 font-medium">
            Toplam <span className="font-bold text-slate-700">{totalCount}</span> kayıttan <span className="font-bold text-slate-700">{offset + 1}</span> - <span className="font-bold text-slate-700">{Math.min(offset + limit, totalCount)}</span> arası gösteriliyor
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href={`${path}?page=${currentPage - 1}`}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 ${
                currentPage <= 1 ? 'pointer-events-none opacity-40' : ''
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div className="text-xs font-semibold text-slate-600 px-3 py-1.5 bg-slate-100 rounded-xl">
              Sayfa {currentPage} / {totalPages}
            </div>
            <Link
              href={`${path}?page=${currentPage + 1}`}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 ${
                currentPage >= totalPages ? 'pointer-events-none opacity-40' : ''
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default async function YurtdisiDashboardPage(props: { searchParams?: Promise<{ [key: string]: string | undefined }> }) {
  try {
    const supabase = await createClient()
    const searchParams = await props.searchParams
    const q = searchParams?.q?.toLowerCase() || ''
    const typeFilter = searchParams?.type || 'ALL'
    const statusFilter = searchParams?.status || 'ALL'
    const currentPage = Number(searchParams?.page || '1')

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
      const { data: sData, count: sCount } = await supabase.from('shares').select('*', { count: 'exact' }).eq('campaign_id', activeCampaign.id).eq('region', 'YURTDISI').order('created_at', { ascending: false })

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
        const costTL = Number(s.cost_price || 0) * Number(s.exchange_rate || 1)
        
        totalRevenue += saleTL
        totalCost += costTL

        const unpaidTL = (Number(s.sale_price || 0) - Number(s.total_paid || 0)) * Number(s.exchange_rate || 1)
        pendingRevenue += unpaidTL
      })
    }

    const netProfit = totalRevenue - totalCost
    const formatCurrency = (val: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)

    return (
      <div className="flex flex-col gap-8 animate-fade-in py-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 border-l-4 border-blue-500 pl-3">Yurtdışı Bağış Panosu</h1>
              <p className="text-slate-500 font-medium pl-4">
                {activeCampaign ? `'${activeCampaign.name}' dönemi yurtdışı bağış ve kurban işlemleri.` : 'Sistemde aktif bir dönem bulunmuyor.'}
              </p>
            </div>
            {activeCampaign && (
              <div className="flex-shrink-0 flex flex-wrap items-center gap-2">
                 <Link href="/dashboard/yurtdisi/matchmaking">
                   <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md gap-1.5 cursor-pointer">
                     <ArrowRightLeft className="h-4 w-4" /> Sürükle-Bırak Eşleştirme
                   </Button>
                 </Link>
                 <Link href="/dashboard/yurtdisi/animals">
                   <Button variant="outline" className="text-slate-600 font-semibold shadow-sm border-slate-200 bg-white cursor-pointer">
                     <Beef className="mr-2 h-4 w-4" /> Hayvan Listesi
                   </Button>
                 </Link>
                 <YurtdisiSettingsDialog settings={allSettings} />
                 <BatchAddShareDialog campaignId={activeCampaign.id} defaultInternationalPrice={defIntPrice} defaultInternationalSalePriceTl={defIntSalePriceTl} fixedUsdRate={usdRate} defaultRegion="YURTDISI" />
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
           <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 mt-4 gap-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  Tüm Yurtdışı İşlemleri
              </h2>
              <ExcelSharesExportButton shares={yurtdisiShares} />
           </div>
           <ListFilters showTypes={false} />
           <SharesTable shares={yurtdisiShares} currentPage={currentPage} />
        </div>
      </div>
    )
  } catch (error: any) {
    if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-xl border border-red-200 mt-10">
        <h2 className="text-xl font-bold text-red-700 mb-2">Sayfa Yüklenirken Bir Hata Oluştu</h2>
        <p className="text-red-600 font-mono text-sm max-w-2xl text-center bg-white p-4 rounded border border-red-100 shadow-sm">
          {error?.message || String(error)}
        </p>
        <div className="mt-4 text-xs text-red-500">Lütfen bu hatayı geliştiriciye bildirin.</div>
      </div>
    )
  }
}
