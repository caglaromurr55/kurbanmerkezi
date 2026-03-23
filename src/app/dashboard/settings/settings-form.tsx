'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateSettingsAction, updatePasswordAction } from './actions'
import { DollarSign, Save, KeyRound } from 'lucide-react'

export function SettingsForm({ settings, liveUsdRate }: { settings: any, liveUsdRate: number }) {
  const [loadingObj, setLoadingObj] = useState({ settings: false, pass: false })
  const [fixExchange, setFixExchange] = useState(settings?.fix_exchange_rate || false)

  async function handleSettings(formData: FormData) {
    setLoadingObj(l => ({...l, settings: true}))
    try {
        await updateSettingsAction(formData)
        alert("Ayarlar başarıyla güncellendi.")
    } catch(e: any) {
        alert("Hata: " + e.message)
    }
    setLoadingObj(l => ({...l, settings: false}))
  }

  async function handlePassword(formData: FormData) {
    setLoadingObj(l => ({...l, pass: true}))
    try {
        await updatePasswordAction(formData)
        alert("Şifre başarıyla güncellendi.")
    } catch(e: any) {
        alert("Hata: " + e.message)
    }
    setLoadingObj(l => ({...l, pass: false}))
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
       <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
             <DollarSign className="w-5 h-5 text-emerald-600" /> Finans ve Kur Ayarları
          </CardTitle>
          <CardDescription>
            Yurtdışı satışlar ve anlık dolar kuru tercihlerini yapılandırın.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSettings} className="flex flex-col gap-6">
            <div className="flex bg-slate-50/80 p-4 rounded-xl border border-slate-100 items-center justify-between">
                <div>
                   <Label className="text-base font-bold text-slate-700">Doları Sabitle</Label>
                   <p className="text-xs text-slate-500 mt-1">Kapalıysa sistem otomatik olarak canlı kuru (Mevcut: ~{liveUsdRate.toFixed(2)} ₺) baz alır.</p>
                </div>
                <Switch name="fix_exchange_rate" checked={fixExchange} onCheckedChange={setFixExchange} />
            </div>

            <div className={`transition-all duration-300 ${!fixExchange ? 'opacity-50 pointer-events-none' : ''}`}>
               <Label htmlFor="fixed_usd_rate" className="font-semibold text-slate-700">Sabit Kur Değeri (1 $ Kaç TL?)</Label>
               <Input id="fixed_usd_rate" name="fixed_usd_rate" type="number" step="0.01" defaultValue={settings?.fixed_usd_rate || liveUsdRate.toFixed(2)} className="mt-2" />
               <p className="text-xs text-rose-500 font-medium mt-1">Sabitlenen kur ile yabancı para cinsi hisseler TL'ye çevrilecektir.</p>
            </div>



            <Button type="submit" disabled={loadingObj.settings} className="mt-2 w-full shadow-lg">
                <Save className="w-4 h-4 mr-2" />
                {loadingObj.settings ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-card h-max">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
             <KeyRound className="w-5 h-5 text-amber-600" /> Güvenlik Ayarları
          </CardTitle>
          <CardDescription>
            Sistem giriş şifrenizi güncelleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handlePassword} className="flex flex-col gap-5">
            <div>
               <Label htmlFor="password">Yeni Şifre</Label>
               <Input id="password" name="password" type="password" required className="mt-2" />
            </div>
            <div>
               <Label htmlFor="confirm_password">Yeni Şifre (Tekrar)</Label>
               <Input id="confirm_password" name="confirm_password" type="password" required className="mt-2" />
            </div>

            <Button type="submit" variant="secondary" disabled={loadingObj.pass} className="mt-2 w-full border border-slate-200 shadow-sm bg-white">
                <Save className="w-4 h-4 mr-2" />
                {loadingObj.pass ? 'Güncelleniyor...' : 'Şifreyi Değiştir'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
