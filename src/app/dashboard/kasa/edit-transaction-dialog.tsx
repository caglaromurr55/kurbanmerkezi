'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateTransaction, deleteTransaction } from './actions'
import { Edit, Trash2, Wallet, ArrowRightLeft, AlignLeft } from 'lucide-react'

export function EditTransactionDialog({ transaction }: { transaction: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [type, setType] = useState(transaction.type || 'INCOME')
  const [currency, setCurrency] = useState(transaction.currency || 'TRY')
  const [exchangeRate, setExchangeRate] = useState(transaction.exchange_rate?.toString() || '1.0')
  const [paymentMethod, setPaymentMethod] = useState(transaction.payment_method || 'CASH')
  const [amount, setAmount] = useState(transaction.amount?.toString() || '')
  const [description, setDescription] = useState(transaction.description || '')

  const isIncome = type === 'INCOME'

  async function onSubmit(formData: FormData) {
    setLoading(true)
    formData.append('id', transaction.id)
    formData.append('type', type)
    try {
      await updateTransaction(formData)
      setOpen(false)
    } catch (err: any) {
      alert('İşlem güncellenirken hata: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function onDelete() {
    if (!confirm('Bu kasa kaydını silmek istediğinize emin misiniz?')) return

    setLoading(true)
    const formData = new FormData()
    formData.append('id', transaction.id)
    try {
      await deleteTransaction(formData)
      setOpen(false)
    } catch (err: any) {
      alert('İşlem silinirken hata: ' + err.message)
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
      <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 rounded-full cursor-pointer" />}>
        <Edit className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[450px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isIncome ? 'text-emerald-700' : 'text-red-600'}`}>
            <Edit className="h-5 w-5" />
            Kasa Kaydını Düzenle
          </DialogTitle>
          <DialogDescription>
            {transaction.shares ? (
              <span className="font-semibold text-amber-600">Dikkat: Bu işlem bağışçı ({transaction.shares.donor_name}) ödemesiyle bağlantılıdır. Tutarı güncellemek hisse bakiye durumunu değiştirebilir.</span>
            ) : (
              'Kasa hareketinin ayrıntılarını güncelleyin veya kaydı tamamen silin.'
            )}
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type">İşlem Tipi</Label>
            <Select name="type" value={type} onValueChange={(val) => setType(val || 'INCOME')}>
              <SelectTrigger className="bg-slate-50">
                <span className="font-bold">{type === 'INCOME' ? 'GELİR (Giriş)' : 'GİDER (Çıkış)'}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">GELİR (Giriş)</SelectItem>
                <SelectItem value="EXPENSE">GİDER (Çıkış)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount" className={isIncome ? 'text-emerald-700' : 'text-red-700'}>Tutar</Label>
              <div className="relative">
                <Wallet className={`absolute left-3 top-2.5 h-4 w-4 ${isIncome ? 'text-emerald-500' : 'text-red-400'}`} />
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`pl-9 font-bold bg-slate-50 ${isIncome ? 'focus-visible:ring-emerald-400' : 'focus-visible:ring-red-400'}`}
                  placeholder="0.00"
                />
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
                  <ArrowRightLeft className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="exchange_rate"
                    name="exchange_rate"
                    type="number"
                    step="0.0001"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    required
                    className="pl-9 bg-slate-50 focus-visible:ring-blue-400"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-2 p-2 px-1">
            <Label htmlFor="description">Açıklama</Label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Örn: Nakliyat Gideri, Ofis İhtiyacı vb."
                required
                className="pl-9 bg-slate-50"
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-white pt-2 flex gap-3">
            <Button type="button" variant="destructive" onClick={onDelete} className="w-1/3 shadow-sm gap-1 hover:bg-red-700" disabled={loading}>
              <Trash2 className="h-4 w-4" /> Sil
            </Button>
            <Button type="submit" className={`w-2/3 shadow-lg ${isIncome ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`} disabled={loading}>
              {loading ? 'Güncelleniyor...' : 'KAYDET'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
