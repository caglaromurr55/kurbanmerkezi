'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Globe, Calendar, Layers } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PrintAllCardsDialogProps {
  animals: any[]
  campaignYear: number
}

export function PrintAllCardsDialog({ animals, campaignYear }: PrintAllCardsDialogProps) {
  const [open, setOpen] = useState(false)
  const [yearInput, setYearInput] = useState(String(campaignYear || new Date().getFullYear()))
  const [regionInput, setRegionInput] = useState('AFRİKA-ÇAD')

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer gap-1.5" />}>
        <Layers className="w-4 h-4" />
        Toplu Kurban Kartı Yazdır ({animals.length})
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] sm:max-w-[950px] max-h-[95vh] overflow-y-auto flex flex-col md:flex-row gap-6 p-6">
        {/* Style block for print layout isolation */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #print-all-cards-area, #print-all-cards-area * {
              visibility: visible !important;
            }
            #print-all-cards-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              display: block !important;
            }
            .print-card-page {
              width: 297mm !important;
              height: 210mm !important;
              padding: 15mm 20mm !important;
              box-sizing: border-box !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              background: white !important;
              page-break-after: always !important;
              break-after: page !important;
              border: none !important;
              margin: 0 !important;
            }
            @page {
              size: landscape;
              margin: 0;
            }
          }
        `}</style>

        {/* LEFT COLUMN: Configuration */}
        <div className="flex-1 flex flex-col gap-5 max-w-[280px]">
          <div>
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" /> Toplu Kart Yazdır
              </DialogTitle>
              <DialogDescription>
                Tüm yurtdışı kurbanlıkların kartlarını tek seferde toplu olarak yazdırın.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex flex-col gap-4 border-t pt-4">
            <div className="grid gap-1.5">
              <Label htmlFor="global_card_year" className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Kurban Yılı (Tümü İçin)
              </Label>
              <Input
                id="global_card_year"
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                placeholder="Örn: 2026"
                className="font-semibold text-slate-700"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="global_card_region" className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Bölge / Ülke (Tümü İçin)
              </Label>
              <Input
                id="global_card_region"
                value={regionInput}
                onChange={(e) => setRegionInput(e.target.value)}
                placeholder="Örn: AFRİKA-ÇAD"
                className="font-bold text-slate-800 uppercase"
              />
            </div>
          </div>

          <div className="mt-auto border-t pt-4 flex flex-col gap-2">
            <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold w-full shadow-md gap-1.5">
              <Printer className="w-4 h-4" /> Hepsini PDF / Yazdır
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full">
              Kapat
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Scrollable Preview of ALL Cards */}
        <div className="flex-1 bg-slate-100/60 p-4 rounded-xl border border-slate-200/50 flex flex-col gap-6 items-center max-h-[80vh] overflow-y-auto">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest self-start px-2">Toplu Baskı Önizlemesi ({animals.length} Kart)</span>
          
          <div id="print-all-cards-area" className="flex flex-col gap-6 w-full items-center">
            {animals.map((animal, cardIdx) => {
              const earTagDisplay = animal.ear_tag ? animal.ear_tag.replace(/^YD-/, '') : '';
              return (
                <div 
                  key={animal.id}
                  className="print-card-page w-[520px] h-[360px] bg-white border border-slate-300 rounded-lg p-5 flex flex-col justify-between font-sans relative shadow-md shrink-0 select-none text-black mb-2"
                >
                  {/* Top Row: Flags and AGD Logo */}
                  <div className="flex items-center justify-between w-full border-b-2 border-slate-100 pb-3">
                    {/* Chad Flag */}
                    <div className="w-12 h-12 rounded-full overflow-hidden flex border border-slate-200 shadow-sm shrink-0">
                      <div className="flex-1 bg-[#002664]"></div>
                      <div className="flex-1 bg-[#FECB00]"></div>
                      <div className="flex-1 bg-[#C60C30]"></div>
                    </div>
                    
                    {/* AGD Logo */}
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 100 100" width="38" height="38" className="text-blue-600 fill-none stroke-current shrink-0">
                        <circle cx="50" cy="50" r="45" strokeWidth="2.5" />
                        <path d="M5,50 H95 M50,5 V95" strokeWidth="1.5" />
                        <path d="M15,25 Q50,45 85,25 M15,75 Q50,55 85,75" strokeWidth="1.5" />
                        <path d="M25,15 Q45,50 25,85 M75,15 Q55,50 75,85" strokeWidth="1.5" />
                        <path d="M58,58 A15,15 0 1,0 35,42 A12,12 0 1,1 58,58" fill="#FFF" strokeWidth="0.5" />
                      </svg>
                      <div className="flex flex-col text-left">
                        <span className="text-base font-black tracking-tight text-slate-800 leading-none">AGD</span>
                        <span className="text-[5.5px] font-black uppercase tracking-widest text-slate-500 mt-0.5">ANADOLU GENÇLİK DERNEĞİ</span>
                      </div>
                    </div>

                    {/* Turkish Flag */}
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-sm flex items-center justify-center bg-[#E30A17] relative">
                      <svg viewBox="0 0 300 200" width="28" height="28" className="text-white fill-current">
                        <circle cx="100" cy="100" r="50" fill="#FFF"/>
                        <circle cx="112.5" cy="100" r="40" fill="#E30A17"/>
                        <polygon points="145,100 128,109 134,91 118,82 138,82" fill="#FFF" transform="rotate(18 135 100)"/>
                      </svg>
                    </div>
                  </div>

                  {/* Main Section */}
                  <div className="flex-1 flex gap-5 mt-4">
                    {/* Left Column: Ear Tag Box */}
                    <div className="w-[120px] border-[3px] border-black p-2 flex flex-col justify-between items-center text-center rounded-sm shrink-0">
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-4xl font-black text-black tracking-tighter uppercase leading-none break-all max-w-[100px]">
                          {earTagDisplay || animal.ear_tag || '-'}
                        </span>
                      </div>
                      <div className="w-full border-t-[3px] border-black my-2"></div>
                      <div className="flex flex-col gap-0.5 uppercase leading-none">
                        <span className="text-[7px] font-extrabold tracking-widest text-slate-500">KURBAN {yearInput}</span>
                        <span className="text-[8px] font-black tracking-wider text-black mt-1 break-words max-w-[100px]">{regionInput}</span>
                      </div>
                    </div>

                    {/* Right Column: 7 Shareholder rows */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      {Array.from({ length: 7 }).map((_, idx) => {
                        const share = animal.shares?.[idx]
                        return (
                          <div key={idx} className="w-full border-b-[2px] border-black flex items-end pb-0.5 text-black animate-fade-in">
                            <span className="text-[10px] font-black w-5 text-slate-400 shrink-0">{idx + 1}</span>
                            <span className="text-xs font-black tracking-wide uppercase truncate leading-none flex-1">
                              {share ? share.donor_name : '.................................................................'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
