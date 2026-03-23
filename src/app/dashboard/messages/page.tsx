import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { sendCustomMessage } from './actions'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: activeCampaign } = await supabase.from('campaigns').select('id, name').eq('is_active', true).single()

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
         <h1 className="text-2xl font-bold tracking-tight">Manuel Mesaj Gönderimi</h1>
         <p className="text-muted-foreground">Bağışçılara toplu WhatsApp/SMS veya duyuru göndermek için kullanabilirsiniz.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yeni Mesaj</CardTitle>
          <CardDescription>
            {activeCampaign ? `'${activeCampaign.name}' dönemindeki bağışçılara mesaj gönderilecek (n8n Webhook üzerinden).` : 'Önce aktif bir dönem seçmelisiniz.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
            {activeCampaign && (
                <form action={sendCustomMessage} className="grid gap-4">
                  <input type="hidden" name="campaign_id" value={activeCampaign.id} />
                  <div className="grid gap-2">
                    <Label htmlFor="message">Mesajınız</Label>
                    <Textarea id="message" name="message" placeholder="Değerli bağışçımız, kurban kesim operasyonumuz an itibariyle başlamıştır..." rows={5} required />
                  </div>
                  <Button type="submit" className="w-full sm:w-auto sm:place-self-end">Gönder (Tetikle)</Button>
                </form>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
