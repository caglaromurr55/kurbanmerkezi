import { createClient } from '@/utils/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddShareDialog } from './add-share-dialog'
import { AutoMatchButton } from './auto-match-button'
import { PrintButton } from '@/components/print-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { EditShareDialog } from '@/app/dashboard/animals/edit-share-dialog'
import { AddPaymentDialog } from './add-payment-dialog'
import { ListFilters } from '@/components/list-filters'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

function SharesTable({ shares, currentPage, path = '/dashboard/shares' }: { shares: any[], currentPage: number, path?: string }) {
  const limit = 25
  const offset = (currentPage - 1) * limit
  const totalCount = shares.length
  const totalPages = Math.max(1, Math.ceil(totalCount / limit))
  const paginatedShares = shares.slice(offset, offset + limit)

  return (
    <div className="space-y-4 mt-4 print:hidden">
      <div className="glass-card rounded-[20px] overflow-x-auto w-full">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-slate-700">Bağışçı Adı</TableHead>
              <TableHead className="font-bold text-slate-700">Telefon</TableHead>
              <TableHead className="font-bold text-slate-700">Referans</TableHead>
              <TableHead className="font-bold text-slate-700">Bakiye & Durum</TableHead>
              <TableHead className="font-bold text-slate-700">Eşleşen Hayvan</TableHead>
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
                  {share.reference_name ? <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">{share.reference_name}</span> : <span className="text-slate-400 text-xs">-</span>}
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
                <TableCell>
                    {share.animals ? 
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100/50 text-emerald-700 border border-emerald-200 block w-max">
                        {share.animals.type === 'BUYUKBAS' ? 'Büyükbaş' : 'Küçükbaş'} • {share.animals.ear_tag || 'İsimsiz'}
                      </span>
                    : 
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100/50 text-amber-700 border border-amber-200 block w-max">
                        Havuza Bırakıldı
                      </span>
                    }
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
                <TableCell colSpan={6} className="h-32 text-center text-slate-400 font-medium">
                  Bu kategoride henüz kayıt yok.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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

function PrintSharesTable({ shares, title }: { shares: any[], title: string }) {
  return (
    <div className="hidden print:block w-full mt-4 text-black bg-white">
      <div className="flex flex-col gap-1 mb-4 border-b border-slate-300 pb-2">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <span className="text-xs text-slate-500 font-semibold">Toplam Kayıt Sayısı: {shares.length}</span>
      </div>
      <div className="border border-slate-300 rounded-[12px] overflow-hidden w-full bg-white shadow-none">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-300">
              <th className="p-3 font-bold border-r border-slate-200 w-[5%] text-slate-700">#</th>
              <th className="p-3 font-bold border-r border-slate-200 w-[22%] text-slate-700">Bağışçı Adı</th>
              <th className="p-3 font-bold border-r border-slate-200 w-[15%] text-slate-700">Telefon</th>
              <th className="p-3 font-bold border-r border-slate-200 w-[18%] text-slate-700">Referans</th>
              <th className="p-3 font-bold border-r border-slate-200 w-[25%] text-slate-700 text-center">Bakiye Bilgisi</th>
              <th className="p-3 font-bold text-slate-700">Eşleşen Kurban</th>
            </tr>
          </thead>
          <tbody>
            {shares.map((share, idx) => {
              const remaining = Math.max(0, Number(share.sale_price || 0) - Number(share.total_paid || 0))
              const paymentLabel = share.payment_status === 'PAID' ? 'ÖDENDİ' : share.payment_status === 'PARTIAL' ? 'KISMİ' : 'ÖDENMEDİ';
              return (
                <tr key={share.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50/50">
                  <td className="p-3 border-r border-slate-200 font-semibold text-slate-500 text-center">{idx + 1}</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-800">{share.donor_name}</td>
                  <td className="p-3 border-r border-slate-200 font-medium text-slate-700 tracking-wide">{share.donor_phone}</td>
                  <td className="p-3 border-r border-slate-200 font-semibold text-slate-700">
                    {share.reference_name ? (
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">
                        {share.reference_name}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-3 border-r border-slate-200 text-xs">
                    <div className="flex justify-between items-center gap-4 max-w-[240px] mx-auto text-[11px]">
                      <span className="text-slate-500 font-medium">Satış: <strong className="text-slate-700 font-bold">{share.sale_price || 0} {share.currency}</strong></span>
                      <span className="text-emerald-600 font-medium">Ödenen: <strong className="font-bold">{share.total_paid || 0} {share.currency}</strong></span>
                      <span className={`${remaining > 0 ? 'text-rose-600' : 'text-slate-400'} font-bold`}>Kalan: {remaining} {share.currency}</span>
                      <span className={`text-[9px] font-extrabold uppercase ml-1 ${share.payment_status === 'PAID' ? 'text-emerald-600' : share.payment_status === 'PARTIAL' ? 'text-amber-500' : 'text-rose-500'}`}>
                        {paymentLabel}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-700 font-semibold">
                    {share.animals ? (
                      <span>
                        {share.animals.type === 'BUYUKBAS' ? 'Büyükbaş' : 'Küçükbaş'} • {share.animals.ear_tag || 'İsimsiz'}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium italic text-xs">Havuza Bırakıldı</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {shares.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 font-medium italic">Kayıt bulunmuyor.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default async function SharesPage(props: { searchParams?: Promise<{ [key: string]: string | undefined }> }) {
  try {
    const supabase = await createClient()
    const searchParams = await props.searchParams
    const q = searchParams?.q?.toLowerCase() || ''
    const typeFilter = searchParams?.type || 'ALL'
    const statusFilter = searchParams?.status || 'ALL'
    
    const { data: activeCampaign } = await supabase.from('campaigns').select('id, name').eq('is_active', true).single()
    
    let shares: any[] = []
    let availableAnimals: any[] = []
    
    if (activeCampaign) {
      const { data: sData } = await supabase.from('shares').select('*, animals(ear_tag, type)').eq('campaign_id', activeCampaign.id).order('created_at', { ascending: false })
      let filteredData = sData || []

      // Apply Client side filtering
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
      
      shares = filteredData

      const { data: aData } = await supabase.from('animals').select('id, ear_tag, type').eq('campaign_id', activeCampaign.id)
      availableAnimals = aData || []
    }

    const yurticiHisseler = shares.filter(s => s.region === 'YURTICI' && s.share_type === 'HISSE_SATISI')
    const yurticiBagislar = shares.filter(s => s.region === 'YURTICI' && s.share_type === 'BAGIS')
    const adakAkikalar = shares.filter(s => s.region === 'YURTICI' && (s.share_type === 'ADAK' || s.share_type === 'AKIKA'))

    let defIntPrice = 0
    let defIntSalePriceTl = 0
    let usdRate = 34.0

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
       const { data: ud } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
       const { data: set } = await supabase.from('tenant_settings').select('*').eq('tenant_id', ud?.tenant_id).single()
       if (set) {
         defIntPrice = set.default_international_price || 0
         defIntSalePriceTl = set.default_international_sale_price_tl || 0
         usdRate = set.fixed_usd_rate
         if (!set.fix_exchange_rate) {
           try {
             const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
             const d = await res.json()
             usdRate = d.rates.TRY
           } catch(e) {}
         }
       }
    }

    const currentPage = Number(searchParams?.page || '1')

    return (
      <div className="flex flex-col gap-5 animate-fade-in py-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Hisseler ve Bağışçılar</h1>
              <p className="text-slate-500 font-semibold text-sm print:hidden">Kurban türlerine göre bağışçıları yönetin ve listeleri takip edin.</p>
              <p className="text-slate-500 font-bold text-sm hidden print:block">Aktif Dönem: {activeCampaign?.name || ''}</p>
          </div>
          <div className="flex gap-2 items-center">
              {activeCampaign && <PrintButton />}
              {activeCampaign && <AutoMatchButton campaignId={activeCampaign.id} />}
              {activeCampaign && <AddShareDialog campaignId={activeCampaign.id} animals={availableAnimals} defaultInternationalPrice={defIntPrice} defaultInternationalSalePriceTl={defIntSalePriceTl} fixedUsdRate={usdRate} />}
          </div>
        </div>

        <div className="print:hidden">
          <ListFilters />
        </div>

        <Tabs defaultValue="yurtici" className="w-full">
          <TabsList className="bg-slate-100/80 p-1 border border-slate-200/60 rounded-xl max-w-full overflow-x-auto flex h-auto justify-start print:hidden">
            <TabsTrigger value="yurtici" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 font-semibold">
              Yurtiçi Hisseler <Badge variant="secondary" className="ml-2 bg-slate-200/50">{yurticiHisseler.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="yurtici_bagis" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 font-semibold">
              Yurtiçi Bağış <Badge variant="secondary" className="ml-2 bg-slate-200/50">{yurticiBagislar.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="adak_akika" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 font-semibold">
              Adak / Akika <Badge variant="secondary" className="ml-2 bg-slate-200/50">{adakAkikalar.length}</Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="yurtici" className="mt-2 outline-none">
            <SharesTable shares={yurticiHisseler} currentPage={currentPage} />
            <PrintSharesTable shares={yurticiHisseler} title="Yurtiçi Hissedar Listesi" />
          </TabsContent>
          <TabsContent value="yurtici_bagis" className="mt-2 outline-none">
            <SharesTable shares={yurticiBagislar} currentPage={currentPage} />
            <PrintSharesTable shares={yurticiBagislar} title="Yurtiçi Bağış Listesi" />
          </TabsContent>
          <TabsContent value="adak_akika" className="mt-2 outline-none">
            <SharesTable shares={adakAkikalar} currentPage={currentPage} />
            <PrintSharesTable shares={adakAkikalar} title="Adak / Akika Listesi" />
          </TabsContent>
        </Tabs>
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
