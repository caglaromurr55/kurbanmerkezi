import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, TrendingDown, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { AddTransactionDialog } from './add-transaction-dialog'
import { EditTransactionDialog } from './edit-transaction-dialog'
import { ExportKasaButton } from './export-button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function KasaPage(props: { searchParams?: Promise<{ [key: string]: string | undefined }> }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  if (!userData?.tenant_id) redirect('/dashboard')

  const { data: activeCampaign } = await supabase.from('campaigns').select('id, name').eq('tenant_id', userData.tenant_id).eq('is_active', true).single()

  if (!activeCampaign) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Aktif Dönem Bulunamadı</h2>
          <p className="text-muted-foreground mt-2">İşlem yapabilmek için lütfen aktif bir kurban dönemi belirleyin.</p>
        </div>
      </div>
    )
  }

  // URL Paging Parameters
  const searchParams = await props.searchParams
  const currentPage = Number(searchParams?.page || '1')
  const limit = 25
  const offset = (currentPage - 1) * limit

  // Tüm işlemleri getir (Finansal toplamlar ve Excel ihracı için)
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`*, shares(donor_name, donor_phone, share_type, animals(ear_tag))`)
    .eq('campaign_id', activeCampaign.id)
    .order('created_at', { ascending: false })

  // 1. Ayarları ve Güncel Döviz Kurlarını Getir
  const { data: settings } = await supabase
    .from('tenant_settings')
    .select('*')
    .eq('tenant_id', userData.tenant_id)
    .single()

  let liveUsdRate = 35.0
  let liveEurRate = 38.0
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { next: { revalidate: 3600 } })
    const data = await res.json()
    liveUsdRate = data.rates.TRY || 35.0
    if (data.rates.EUR) {
      liveEurRate = liveUsdRate / data.rates.EUR
    }
  } catch (e) {
    console.error("Döviz kuru alınamadı")
  }

  // Ayarlara göre kur değerlerini belirle
  const currentUsdRate = settings?.fix_exchange_rate ? Number(settings.fixed_usd_rate || liveUsdRate) : liveUsdRate
  const currentEurRate = settings?.fix_exchange_rate 
    ? (Number(settings.fixed_usd_rate || liveUsdRate) / 0.92) 
    : liveEurRate

  // İstatistikleri hesapla (TRY bazında güncel kurlarla ve ayrı döviz kasalarıyla)
  let totalIncome = 0
  let totalExpense = 0

  let usdIncome = 0
  let usdExpense = 0
  let eurIncome = 0
  let eurExpense = 0

  transactions?.forEach(t => {
      // Döviz kasalarını ayrı ayrı biriktir
      if (t.currency === 'USD') {
        if (t.type === 'INCOME') usdIncome += t.amount
        if (t.type === 'EXPENSE') usdExpense += t.amount
      } else if (t.currency === 'EUR') {
        if (t.type === 'INCOME') eurIncome += t.amount
        if (t.type === 'EXPENSE') eurExpense += t.amount
      }

      // Güncel canlı kur üzerinden TL karşılığını hesapla
      let currentRate = 1
      if (t.currency === 'USD') {
        currentRate = currentUsdRate
      } else if (t.currency === 'EUR') {
        currentRate = currentEurRate
      } else {
        currentRate = 1 // TRY
      }

      const thb = t.amount * currentRate
      if (t.type === 'INCOME') totalIncome += thb
      if (t.type === 'EXPENSE') totalExpense += thb
  })

  const netBalance = totalIncome - totalExpense
  const netUsdBalance = usdIncome - usdExpense
  const netEurBalance = eurIncome - eurExpense

  // Pagination slicing
  const totalCount = transactions?.length || 0
  const totalPages = Math.max(1, Math.ceil(totalCount / limit))
  const paginatedTransactions = transactions?.slice(offset, offset + limit) || []

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Kasa Defteri</h1>
          <p className="text-muted-foreground">'{activeCampaign.name}' dönemine ait tüm gelir, gider ve bağış tahsilatları.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <ExportKasaButton transactions={transactions || []} campaignName={activeCampaign.name} />
          <AddTransactionDialog campaignId={activeCampaign.id} type="EXPENSE" />
          <AddTransactionDialog campaignId={activeCampaign.id} type="INCOME" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card border-none shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-16 h-16 text-emerald-500" /></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Toplam Gelir (Tahsilat)</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg"><TrendingUp className="h-4 w-4 text-emerald-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700">₺ {totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Sisteme giren tüm ödemeler (Güncel Canlı Kurla)</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingDown className="w-16 h-16 text-red-500" /></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Toplam Gider (Harcama)</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg"><TrendingDown className="h-4 w-4 text-red-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-red-700">₺ {totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Kasadan çıkan tüm ödemeler (Güncel Canlı Kurla)</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-sm relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="w-16 h-16 text-indigo-500" /></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-800">Net Bakiye</CardTitle>
            <div className="p-2 bg-indigo-100 rounded-lg"><Wallet className="h-4 w-4 text-indigo-700" /></div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-black ${netBalance >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>
              ₺ {netBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-indigo-600/70 mt-1 font-medium">Kasadaki Güncel TL Karşılığı Nakit</p>
          </CardContent>
        </Card>
      </div>

      {/* DÖVİZ KASALARI */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card border-none shadow-sm relative overflow-hidden bg-gradient-to-br from-emerald-50/10 to-white border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Dolar Kasası (USD)</CardTitle>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 shadow-none font-bold">1 $ = {currentUsdRate.toFixed(2)} ₺</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">$ {netUsdBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Kasadaki Güncel Karşılığı: <span className="text-emerald-600 font-bold">₺ {(netUsdBalance * currentUsdRate).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-sm relative overflow-hidden bg-gradient-to-br from-blue-50/10 to-white border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Euro Kasası (EUR)</CardTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 shadow-none font-bold">1 € = {currentEurRate.toFixed(2)} ₺</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">€ {netEurBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Kasadaki Güncel Karşılığı: <span className="text-blue-600 font-bold">₺ {(netEurBalance * currentEurRate).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center gap-2">
             <Clock className="w-5 h-5 text-slate-400" /> Son Kasa Hareketleri
          </CardTitle>
          <CardDescription>Gelir ve gider işlemlerinin kronolojik listesi (Sayfa {currentPage} / {totalPages})</CardDescription>
        </CardHeader>
        <CardContent>
          {(!transactions || transactions.length === 0) ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                Henüz kasa hareketi bulunmuyor.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border overflow-x-auto w-full bg-white">
                  <Table>
                  <TableHeader className="bg-slate-50/80">
                      <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>İşlem Tipi</TableHead>
                      <TableHead>Kategori / Bağlantı</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Yöntem</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                      <TableHead className="text-center w-20">Aksiyon</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {paginatedTransactions.map((t) => (
                      <TableRow key={t.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-medium whitespace-nowrap text-xs text-slate-500">
                            {new Date(t.created_at).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour:'2-digit', minute:'2-digit' })}
                          </TableCell>
                          <TableCell>
                            {t.type === 'INCOME' ? (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">GELİR</Badge>
                            ) : (
                                <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">GİDER</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {t.shares ? (
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-slate-700">{t.shares.donor_name}</span>
                                    <span className="text-xs text-slate-500">Hisse Tahsilatı</span>
                                </div>
                            ) : (
                                <span className="text-sm font-medium text-slate-600">Manuel İşlem</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[250px] truncate text-slate-600">
                            {t.description || '-'}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-md text-slate-600">
                               {t.payment_method === 'CASH' ? 'Nakit' : t.payment_method === 'CREDIT_CARD' ? 'Kredi Kartı' : 'Havale/EFT'}
                            </span>
                          </TableCell>
                          <TableCell className={`text-right font-bold whitespace-nowrap ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                             {t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {t.currency}
                             {t.currency !== 'TRY' && (
                                 <div className="text-[10px] text-slate-400 font-normal mt-0.5 flex flex-col items-end gap-0.5">
                                    <span>Alış: ₺ {(t.amount * t.exchange_rate).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                    <span className="text-indigo-600 font-bold bg-indigo-50/50 px-1 py-0.5 rounded text-[9px]">Güncel: ₺ {(t.amount * (t.currency === 'USD' ? currentUsdRate : currentEurRate)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                 </div>
                             )}
                          </TableCell>
                          <TableCell className="text-center">
                            <EditTransactionDialog transaction={t} />
                          </TableCell>
                      </TableRow>
                      ))}
                  </TableBody>
                  </Table>
              </div>

              {/* Sayfalama Kontrolleri */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4 px-2">
                  <div className="text-xs text-slate-500 font-medium">
                    Toplam <span className="font-bold text-slate-700">{totalCount}</span> kayıttan <span className="font-bold text-slate-700">{offset + 1}</span> - <span className="font-bold text-slate-700">{Math.min(offset + limit, totalCount)}</span> arası gösteriliyor
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/dashboard/kasa?page=${currentPage - 1}`}
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
                      href={`/dashboard/kasa?page=${currentPage + 1}`}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
