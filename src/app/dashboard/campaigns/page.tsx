import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AddCampaignDialog } from './add-campaign-dialog'

export default async function CampaignsPage() {
  const supabase = await createClient()
  
  const { data: campaigns } = await supabase.from('campaigns').select('*').order('year', { ascending: false })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Dönemler (Kampanyalar)</h1>
            <p className="text-muted-foreground">Aktif çalışma döneminizi buradan ayarlayabilirsiniz.</p>
        </div>
        <AddCampaignDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campaigns?.map((campaign) => (
          <Card key={campaign.id} className={`glass-card relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${campaign.is_active ? 'border-primary/50 ring-1 ring-primary/20' : 'opacity-80'}`}>
            {campaign.is_active && <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-2xl" />}
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800">{campaign.name}</CardTitle>
              <CardDescription className="font-medium">{campaign.year} Yılı Dönemi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${campaign.is_active ? 'bg-primary/15 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                  {campaign.is_active ? 'AKTİF KAMPANYA' : 'PASİF'}
                </span>
                {!campaign.is_active && <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white transition-colors">Aktif Yap</Button>}
              </div>
            </CardContent>
          </Card>
        ))}

        {!campaigns?.length && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white/40 backdrop-blur-md rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-lg font-medium">Henüz hiçbir kurban dönemi (kampanya) oluşturulmamış.</p>
            <p className="text-sm mt-1">Sağ üstten "Yeni Dönem Ekle" butonunu kullanın.</p>
          </div>
        )}
      </div>
    </div>
  )
}
