'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Tag, Globe, Calendar, Settings } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PrintCardDialogProps {
  animal: any
  campaignYear: number
  campaignName: string
}

export function PrintCardDialog({ animal, campaignYear, campaignName }: PrintCardDialogProps) {
  const [open, setOpen] = useState(false)
  const [earTagInput, setEarTagInput] = useState(() => {
    // Strip "YD-" or other prefixes to leave just the number if possible
    return animal.ear_tag ? animal.ear_tag.replace(/^YD-/, '') : ''
  })
  const [yearInput, setYearInput] = useState(String(campaignYear || new Date().getFullYear()))
  const [regionInput, setRegionInput] = useState('AFRİKA-ÇAD')

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold gap-1.5 cursor-pointer w-full" />}>
        <Printer className="w-4 h-4 text-blue-500" />
        Kurban Kartı Yazdır
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] sm:max-w-[900px] max-h-[95vh] overflow-y-auto flex flex-col md:flex-row gap-6 p-6">
        {/* Style block for print layout isolation */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #print-card-area, #print-card-area * {
              visibility: visible !important;
            }
            #print-card-area {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 297mm !important;
              height: 210mm !important;
              background: white !important;
              margin: 0 !important;
              padding: 15mm 20mm !important;
              box-shadow: none !important;
              border: none !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              box-sizing: border-box !important;
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
                <Printer className="w-5 h-5 text-blue-500" /> Kurban Kartı Yazdır
              </DialogTitle>
              <DialogDescription>
                Afrika kesim şablonuna göre kurbanlık kartı özelleştirin ve yazdırın.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex flex-col gap-4 border-t pt-4">
            <div className="grid gap-1.5">
              <Label htmlFor="card_tag" className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Küpe / Hayvan No
              </Label>
              <Input
                id="card_tag"
                value={earTagInput}
                onChange={(e) => setEarTagInput(e.target.value)}
                placeholder="Örn: 81"
                className="font-bold text-slate-800"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="card_year" className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Kurban Yılı
              </Label>
              <Input
                id="card_year"
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                placeholder="Örn: 2026"
                className="font-semibold text-slate-700"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="card_region" className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Bölge / Ülke
              </Label>
              <Input
                id="card_region"
                value={regionInput}
                onChange={(e) => setRegionInput(e.target.value)}
                placeholder="Örn: AFRİKA-ÇAD"
                className="font-bold text-slate-800 uppercase"
              />
            </div>
          </div>

          <div className="mt-auto border-t pt-4 flex flex-col gap-2">
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full shadow-md gap-1.5">
              <Printer className="w-4 h-4" /> Kartı PDF / Yazdır
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full">
              Kapat
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Preview */}
        <div className="flex-1 bg-slate-100/60 p-4 rounded-xl border border-slate-200/50 flex items-center justify-center min-h-[300px] overflow-x-auto">
          {/* Print Card Container */}
          <div 
            id="print-card-area" 
            className="w-[520px] h-[360px] bg-white border border-slate-300 rounded-lg p-5 flex flex-col justify-between font-sans relative shadow-md shrink-0 select-none bg-white text-black"
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
                    {earTagInput || animal.ear_tag || '-'}
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
                    <div key={idx} className="w-full border-b-[2px] border-black flex items-end pb-0.5 text-black">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
