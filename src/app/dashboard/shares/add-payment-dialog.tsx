'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addPayment } from './actions'
import { HandCoins, Wallet, ArrowRightLeft, AlignLeft } from 'lucide-react'

export function AddPaymentDialog({ share }: { share: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [currency, setCurrency] = useState(share.currency || 'TRY')
  const [exchangeRate, setExchangeRate] = useState(share.exchange_rate ? String(share.exchange_rate) : '1.0')
  const [paymentMethod, setPaymentMethod] = useState('CASH')

  // Calculate remaining balance to suggest as default payment.
  // Actually, calculating remaining is complex without total_paid.
  // Let's assume total_paid is returned in share.
  const remaining = Math.max(0, Number(share.sale_price) - Number(share.total_paid || 0))

  async function onSubmit(formData: FormData) {
    setLoading(true)
    formData.append('share_id', share.id)
    try {
        await addPayment(formData)
        setOpen(false)
    } catch (e: any) {
        alert(e.message)
    } finally {
        setLoading(false)
    }
  }

  const handleCurrencyChange = (val: string | null) => {
    const value = val || 'TRY'
    setCurrency(value)
    if (value === 'TRY') setExchangeRate('1.0')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="h-7 text-xs px-2 shadow-sm border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 mr-2" disabled={share.payment_status === 'PAID'}>
          <HandCoins className="w-3 h-3 mr-1" /> Tahsilat
        </Button>}>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[450px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-700">
             <HandCoins className="h-5 w-5" />
             Kasa Tahsilatı Gir
          </DialogTitle>
          <DialogDescription>
            <strong>{share.donor_name}</strong> isimli bağışçıdan aldığınız ödemeyi kasaya kaydedin.
          </DialogDescription>
        </DialogHeader>
        
        <form action={onSubmit} className="grid gap-5 py-2">
          
          <div className="bg-slate-50 border p-3 rounded-lg flex justify-between text-sm">
             <div>
               <p className="text-slate-500 font-medium">Toplam Tutar</p>
               <p className="font-bold text-slate-800">{share.sale_price} {share.currency}</p>
             </div>
             <div className="text-right">
               <p className="text-slate-500 font-medium">Kalan Bakiye</p>
               <p className="font-bold text-rose-600">{remaining} {share.currency}</p>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="amount" className="text-emerald-700">Tahsil Edilen (Gelen)</Label>
                <div className="relative">
                    <Wallet className="absolute left-3 top-2 h-4 w-4 text-emerald-500" />
                    <Input id="amount" name="amount" type="number" step="0.01" defaultValue={remaining} required className="pl-9 font-bold bg-white focus-visible:ring-emerald-400" placeholder="0.00" />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="payment_method">Ödeme Yöntemi</Label>
                <Select name="payment_method" value={paymentMethod} onValueChange={(val) => setPaymentMethod(val || 'CASH')}>
                <SelectTrigger className="bg-white">
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
                <SelectTrigger className="bg-white">
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
                <div className="grid gap-2 animate-in fade-in">
                    <Label htmlFor="exchange_rate">Anlık Kur (1 {currency}=? TL)</Label>
                    <div className="relative">
                        <ArrowRightLeft className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                        <Input id="exchange_rate" name="exchange_rate" type="number" step="0.0001" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} required className="pl-9 bg-white" />
                    </div>
                </div>
            )}
          </div>

          <div className="grid gap-2 p-2 px-1">
            <Label htmlFor="description">Açıklama / Not</Label>
            <div className="relative">
               <AlignLeft className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
               <Input id="description" name="description" placeholder="Örn: Nakit teslim alındı vb." defaultValue={`${share.donor_name} - Hisse Tahsilatı`} required className="pl-9 bg-white" />
            </div>
          </div>

          <Button type="submit" className="w-full shadow-lg bg-emerald-600 hover:bg-emerald-700 mt-2" disabled={loading}>
            {loading ? 'İşleniyor...' : 'TAHSİLATI KAYDET'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
