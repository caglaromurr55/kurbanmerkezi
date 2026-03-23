import { createClient } from '@/utils/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddShareDialog } from './add-share-dialog'
import { AutoMatchButton } from './auto-match-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { EditShareDialog } from '@/app/dashboard/animals/edit-share-dialog'
import { AddPaymentDialog } from './add-payment-dialog'
import { ListFilters } from '@/components/list-filters'

function SharesTable({ shares }: { shares: any[] }) {
  return (
    <div className="glass-card rounded-[20px] overflow-x-auto w-full mt-4">
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
          {shares.map((share) => (
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
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">
                    {share.status === 'ASSIGNED' ? 'ATANDI' : share.status}
                  </span>
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
              <TableCell colSpan={7} className="h-32 text-center text-slate-400 font-medium">
                Bu kategoride henüz kayıt yok.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default async function SharesPage(props: { searchParams?: Promise<{ [key: string]: string | undefined }> }) {
  const supabase = await createClient()
  const searchParams = await props.searchParams
  const q = searchParams?.q?.toLowerCase() || ''
  const typeFilter = searchParams?.type || 'ALL'
  const statusFilter = searchParams?.status || 'ALL'
  
  const { data: activeCampaign } = await supabase.from('campaigns').select('id').eq('is_active', true).single()
  
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

  return (
    <div className="flex flex-col gap-5 animate-fade-in py-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Hisseler ve Bağışçılar</h1>
            <p className="text-slate-500 font-medium">Kurban türlerine göre bağışçıları yönetin ve listeleri takip edin.</p>
        </div>
        <div className="flex gap-2">
            {activeCampaign && <AutoMatchButton campaignId={activeCampaign.id} />}
            {activeCampaign && <AddShareDialog campaignId={activeCampaign.id} animals={availableAnimals} defaultInternationalPrice={defIntPrice} defaultInternationalSalePriceTl={defIntSalePriceTl} fixedUsdRate={usdRate} />}
        </div>
      </div>

      <ListFilters />

      <Tabs defaultValue="yurtici" className="w-full">
        <TabsList className="bg-slate-100/80 p-1 border border-slate-200/60 rounded-xl max-w-full overflow-x-auto flex h-auto justify-start">
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
          <SharesTable shares={yurticiHisseler} />
        </TabsContent>
        <TabsContent value="yurtici_bagis" className="mt-2 outline-none">
          <SharesTable shares={yurticiBagislar} />
        </TabsContent>
        <TabsContent value="adak_akika" className="mt-2 outline-none">
          <SharesTable shares={adakAkikalar} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

