import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Beef } from 'lucide-react'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  const error = params?.error

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50">
      {/* DİNAMİK ARKA PLAN GRADIENT */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.1),_transparent_60%)]" />
      <div className="absolute top-[-10%] left-[-10%] z-0 h-[500px] w-[500px] rounded-full bg-emerald-300/20 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] z-0 h-[400px] w-[400px] rounded-full bg-blue-300/20 blur-[120px]" />

      <div className="z-10 w-full max-w-md px-4 sm:px-0 animate-slide-up opacity-0">
        <div className="flex flex-col items-center space-y-3 mb-8">
            <div className="flex relative h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl shadow-primary/20 overflow-hidden p-2">
              <img src="/logo.png" alt="Kurban Merkezi Logo" className="object-contain w-full h-full" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Kurban Merkezi
            </h1>
            <p className="text-sm text-slate-500 font-medium">
                Profesyonel Organizasyon Yönetimi
            </p>
        </div>

        <div className="glass-card rounded-[24px] p-8">
          <form action={login} className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email" className="text-slate-700">E-posta Adresi</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="sistem@dernek.com"
                className="h-12 bg-white/50 border-slate-200 focus:ring-primary/20"
                required 
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700">Şifre</Label>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••"
                className="h-12 bg-white/50 border-slate-200 focus:ring-primary/20"
                required 
              />
            </div>
            {error && (
              <div className="rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="h-12 w-full text-base font-semibold shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]">
              Giriş Yap
            </Button>
          </form>
        </div>
        <p className="mt-8 text-center text-xs text-slate-400">
            © 2026 Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  )
}
