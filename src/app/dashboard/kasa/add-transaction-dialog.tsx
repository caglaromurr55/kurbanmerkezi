'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addTransaction } from './actions'
import { PlusCircle, MinusCircle, Wallet, ArrowRightLeft, AlignLeft, CreditCard } from 'lucide-react'

export function AddTransactionDialog({ campaignId, type }: { campaignId: string, type: 'INCOME' | 'EXPENSE' }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [currency, setCurrency] = useState('TRY')
  const [exchangeRate, setExchangeRate] = useState('1.0')
  const [paymentMethod, setPaymentMethod] = useState('CASH')

  const isIncome = type === 'INCOME'

  async function onSubmit(formData: FormData) {
    setLoading(true)
    formData.append('campaign_id', campaignId)
    formData.append('type', type)
    await addTransaction(formData)
    setLoading(false)
    setOpen(false)
  }

  const handleCurrencyChange = (val: string | null) => {
    const value = val || 'TRY'
    setCurrency(value)
    if (value === 'TRY') setExchangeRate('1.0')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={isIncome ? "default" : "destructive"} className={`shadow-sm ${isIncome ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}>
          {isIncome ? <PlusCircle className="mr-2 h-4 w-4" /> : <MinusCircle className="mr-2 h-4 w-4" />}
          {isIncome ? 'Gelir Ekle' : 'Gider / Çıkış'}
        </Button>}>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[450px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isIncome ? 'text-emerald-700' : 'text-red-600'}`}>
             {isIncome ? <PlusCircle className="h-5 w-5" /> : <MinusCircle className="h-5 w-5" />}
             Kasa {isIncome ? 'Geliri' : 'Gideri'} Ekle
          </DialogTitle>
          <DialogDescription>
            Kasaya manuel olarak nakit, kart veya havale işlemi girin.
          </DialogDescription>
        </DialogHeader>
        
        <form action={onSubmit} className="grid gap-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="amount" className={isIncome ? 'text-emerald-700' : 'text-red-700'}>Tutar</Label>
                <div className="relative">
                    <Wallet className={`absolute left-3 top-2 h-4 w-4 ${isIncome ? 'text-emerald-500' : 'text-red-400'}`} />
                    <Input id="amount" name="amount" type="number" step="0.01" required className={`pl-9 font-bold bg-slate-50 ${isIncome ? 'focus-visible:ring-emerald-400' : 'focus-visible:ring-red-400'}`} placeholder="0.00" />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="payment_method">Ödeme Yöntemi</Label>
                <Select name="payment_method" value={paymentMethod} onValueChange={(val) => setPaymentMethod(val || 'CASH')}>
                <SelectTrigger className="bg-slate-50">
                    <span className="truncate">{paymentMethod === 'CASH' ? 'Nakit' : paymentMethod === 'CREDIT_CARD' ? 'Kredi Kartı' : 'Havale / EFT'}</span>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="CASH">Nakit</SelectItem>
                    <SelectItem value="CREDIT_CARD">Kredi Kartı</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Havale / EFT</SelectItem>
                </SelectContent>
                </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="currency">Para Birimi</Label>
                <Select name="currency" value={currency} onValueChange={handleCurrencyChange} required>
                <SelectTrigger className="bg-slate-50">
                    <span className="truncate">{currency === 'TRY' ? 'Türk Lirası (₺)' : currency === 'USD' ? 'Dolar ($)' : 'Euro (€)'}</span>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="TRY">Türk Lirası (₺)</SelectItem>
                    <SelectItem value="USD">Dolar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
                </Select>
            </div>
            {currency !== 'TRY' && (
                <div className="grid gap-2 animate-in fade-in slide-in-from-top-1">
                    <Label htmlFor="exchange_rate">Anlık Kur (1 {currency} = ? TL)</Label>
                    <div className="relative">
                        <ArrowRightLeft className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                        <Input id="exchange_rate" name="exchange_rate" type="number" step="0.0001" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} required className="pl-9 bg-slate-50 focus-visible:ring-blue-400" />
                    </div>
                </div>
            )}
          </div>

          <div className="grid gap-2 p-2 px-1">
            <Label htmlFor="description">Açıklama</Label>
            <div className="relative">
               <AlignLeft className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
               <Input id="description" name="description" placeholder="Örn: Nakliyat Gideri, Ofis İhtiyacı vb." required className="pl-9 bg-slate-50" />
            </div>
          </div>

          <Button type="submit" className={`w-full shadow-lg ${isIncome ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`} disabled={loading}>
            {loading ? 'İşleniyor...' : (isIncome ? 'GELİRİ KAYDET' : 'GİDERİ KAYDET')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
