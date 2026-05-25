import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { logout } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { LogOut, Home, Users, Beef, Archive, MessageCircle, Wallet, Search, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let tenantName = 'Kurban Merkezi'
  const { data: userData } = await supabase.from('users').select('tenants(name)').eq('id', user.id).single()
  // Suppress TS error for dynamic typing without full interface
  const tName = (userData?.tenants as any)?.name
  if (tName) tenantName = tName

  return (
    <div className="flex min-h-screen flex-col w-full bg-slate-50/50">
      <header className="sticky top-0 z-50 glass-nav flex h-16 items-center gap-2 sm:gap-4 px-2 sm:px-8 print:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="xl:hidden shrink-0" />}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menüyü aç/kapat</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] sm:w-[350px]">
            <SheetTitle className="sr-only">Navigasyon Menüsü</SheetTitle>
            <Link href="/dashboard" className="flex items-center gap-3 font-bold text-lg text-slate-800 border-b pb-4 mb-4 mt-2">
              <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-white shadow-sm">
                 <img src="/logo.png" alt="Kurban Merkezi Logo" className="object-contain w-full h-full p-0.5" />
              </div>
              <span className="tracking-tight">{tenantName}</span>
            </Link>
            <nav className="grid gap-2 text-base font-semibold text-slate-700">
              <Link href="/dashboard" className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-slate-50 hover:text-primary transition-all">
                <Home className="h-5 w-5 opacity-70"/> Ana Ekran
              </Link>
              <Link href="/dashboard/yurtici" className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-slate-50 hover:text-primary transition-all">
                <Beef className="h-5 w-5 opacity-70"/> Yurtiçi Kurban
              </Link>
              <Link href="/dashboard/yurtdisi" className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-slate-50 hover:text-primary transition-all">
                <Users className="h-5 w-5 opacity-70"/> Yurtdışı Kurban
              </Link>
              <Link href="/dashboard/campaigns" className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-slate-50 hover:text-primary transition-all">
                <Archive className="h-5 w-5 opacity-70"/> Dönemler
              </Link>
              <Link href="/dashboard/kasa" className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-slate-50 hover:text-primary transition-all">
                <Wallet className="h-5 w-5 opacity-70"/> Kasa
              </Link>
              <Link href="/dashboard/settings" className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-slate-50 hover:text-primary transition-all">
                <MessageCircle className="h-5 w-5 opacity-70"/> Ayarlar
              </Link>
            </nav>
            <form action="/dashboard/shares" className="mt-6 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input name="q" type="search" placeholder="Kişi veya referans ara..." className="w-full rounded-xl bg-slate-50 pl-10 h-10 border-slate-200" />
            </form>
          </SheetContent>
        </Sheet>
        
        <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3 font-bold text-sm sm:text-lg text-slate-800 transition-transform hover:scale-105">
          <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-white shadow-sm hidden sm:block">
             <img src="/logo.png" alt="Kurban Merkezi Logo" className="object-contain w-full h-full p-0.5" />
          </div>
          <span className="tracking-tight truncate max-w-[120px] sm:max-w-none">{tenantName}</span>
        </Link>
        <nav className="hidden xl:flex ml-8 flex-row items-center gap-1">
          <Link href="/dashboard" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-sm hover:text-primary transition-all">
            <Home className="h-4 w-4"/> Ana Ekran
          </Link>
          <Link href="/dashboard/yurtici" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-sm hover:text-primary transition-all">
            <Beef className="h-4 w-4"/> Yurtiçi Kurban
          </Link>
          <Link href="/dashboard/yurtdisi" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-sm hover:text-primary transition-all">
            <Users className="h-4 w-4"/> Yurtdışı Kurban
          </Link>
          <Link href="/dashboard/campaigns" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-sm hover:text-primary transition-all">
            <Archive className="h-4 w-4"/> Dönemler
          </Link>
          <Link href="/dashboard/kasa" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-sm hover:text-primary transition-all mb-0">
            <Wallet className="h-4 w-4"/> Kasa
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-sm hover:text-primary transition-all">
            <MessageCircle className="h-4 w-4"/> Ayarlar
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <form action="/dashboard/shares" className="hidden md:flex relative mr-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  name="q" 
                  type="search" 
                  placeholder="Kişi veya referans ara..." 
                  className="w-full rounded-full bg-white pl-9 sm:w-[250px] focus-visible:ring-primary shadow-sm h-9 border-slate-200" 
                />
            </form>
            <form action={logout}>
                <Button type="submit" variant="ghost" size="sm" className="gap-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors text-slate-500">
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline font-semibold">Çıkış Yap</span>
                </Button>
            </form>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 max-w-[1400px] w-full mx-auto animate-slide-up print:p-0 print:max-w-none print:w-full print:shadow-none print:mt-0">
        {children}
      </main>
    </div>
  )
}
