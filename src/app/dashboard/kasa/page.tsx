import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { AddTransactionDialog } from './add-transaction-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function KasaPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  try {
    const { data: activeCampaign, error: campaignError } = await supabase.from('campaigns').select('id, name').eq('is_active', true).single()

    if (campaignError) throw campaignError

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

    // İşlemleri getir
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select(`*, shares(donor_name, donor_phone, share_type, animals(ear_tag))`)
      .eq('campaign_id', activeCampaign.id)
      .order('created_at', { ascending: false })

    if (txError) {
        throw txError
    }

    // İstatistikleri hesapla (TRY bazında veya tutar bazında)
    let totalIncome = 0
    let totalExpense = 0

    transactions?.forEach(t => {
        // Amount'u TRY karşılığına çeviriyoruz: amount * exchange_rate
        const thb = Number(t.amount || 0) * Number(t.exchange_rate || 1)
        if (t.type === 'INCOME') totalIncome += thb
        if (t.type === 'EXPENSE') totalExpense += thb
    })

    const netBalance = totalIncome - totalExpense

    return (
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Kasa Defteri</h1>
            <p className="text-muted-foreground">'{activeCampaign.name}' dönemine ait tüm gelir, gider ve bağış tahsilatları.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
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
              <p className="text-xs text-muted-foreground mt-1">Sisteme giren tüm ödemeler (TL Karşılığı)</p>
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
              <p className="text-xs text-muted-foreground mt-1">Kasadan çıkan tüm ödemeler (TL Karşılığı)</p>
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
              <p className="text-xs text-indigo-600/70 mt-1 font-medium">Kasadaki Tahmini Nakit</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center gap-2">
               <Clock className="w-5 h-5 text-slate-400" /> Son Kasa Hareketleri
            </CardTitle>
            <CardDescription>Gelir ve gider işlemlerinin kronolojik listesi</CardDescription>
          </CardHeader>
          <CardContent>
            {(!transactions || transactions.length === 0) ? (
              <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                  Henüz kasa hareketi bulunmuyor.
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto w-full">
                  <Table>
                  <TableHeader className="bg-slate-50/80">
                      <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>İşlem Tipi</TableHead>
                      <TableHead>Kategori / Bağlantı</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Yöntem</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {transactions.map((t) => (
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
                            {t.type === 'INCOME' ? '+' : '-'} {Number(t.amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {t.currency}
                            {t.currency !== 'TRY' && (
                                <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                                   ~ ₺ {Number((t.amount || 0) * (t.exchange_rate || 1)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                </div>
                            )}
                          </TableCell>
                      </TableRow>
                      ))}
                  </TableBody>
                  </Table>
              </div>
            )}
          </CardContent>
        </Card>
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
