'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Tag, Globe, Calendar } from 'lucide-react'
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
  const [slaughterOrder, setSlaughterOrder] = useState('1')
  const [yearInput, setYearInput] = useState(String(campaignYear || new Date().getFullYear()))
  const [regionInput, setRegionInput] = useState('AFRİKA-ÇAD')

  // Custom Logo and Flag Upload States with LocalStorage Persistence
  const [leftFlagImage, setLeftFlagImage] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kurban_card_left_flag')
    }
    return null
  })
  const [centerLogoImage, setCenterLogoImage] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kurban_card_center_logo')
    }
    return null
  })
  const [rightFlagImage, setRightFlagImage] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kurban_card_right_flag')
    }
    return null
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'left' | 'center' | 'right') => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        if (type === 'left') {
          setLeftFlagImage(base64String)
          localStorage.setItem('kurban_card_left_flag', base64String)
        } else if (type === 'center') {
          setCenterLogoImage(base64String)
          localStorage.setItem('kurban_card_center_logo', base64String)
        } else if (type === 'right') {
          setRightFlagImage(base64String)
          localStorage.setItem('kurban_card_right_flag', base64String)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleResetImage = (type: 'left' | 'center' | 'right') => {
    if (type === 'left') {
      setLeftFlagImage(null)
      localStorage.removeItem('kurban_card_left_flag')
    } else if (type === 'center') {
      setCenterLogoImage(null)
      localStorage.removeItem('kurban_card_center_logo')
    } else if (type === 'right') {
      setRightFlagImage(null)
      localStorage.removeItem('kurban_card_right_flag')
    }
  }

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
        <div className="flex-1 flex flex-col gap-4 max-w-[280px]">
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

          <div className="flex flex-col gap-3.5 border-t pt-4">
            <div className="grid gap-1.5">
              <Label htmlFor="card_order" className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Kesim Sırası
              </Label>
              <Input
                id="card_order"
                value={slaughterOrder}
                onChange={(e) => setSlaughterOrder(e.target.value)}
                placeholder="Örn: 1"
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

            {/* Custom Logo and Flag Upload Area */}
            <div className="flex flex-col gap-3 border-t pt-4">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Görsel Yükle / Özelleştir</span>
              
              <div className="grid gap-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="left_flag_file" className="text-[10px] font-bold text-slate-500">Sol Bayrak</Label>
                  {leftFlagImage && (
                    <button onClick={() => handleResetImage('left')} className="text-[9px] text-red-500 font-bold hover:underline cursor-pointer bg-transparent border-0 p-0">Sıfırla</button>
                  )}
                </div>
                <Input
                  id="left_flag_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'left')}
                  className="text-[10px] h-8 cursor-pointer file:text-[10px] file:font-semibold"
                />
              </div>

              <div className="grid gap-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="center_logo_file" className="text-[10px] font-bold text-slate-500">Orta Logo</Label>
                  {centerLogoImage && (
                    <button onClick={() => handleResetImage('center')} className="text-[9px] text-red-500 font-bold hover:underline cursor-pointer bg-transparent border-0 p-0">Sıfırla</button>
                  )}
                </div>
                <Input
                  id="center_logo_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'center')}
                  className="text-[10px] h-8 cursor-pointer file:text-[10px] file:font-semibold"
                />
              </div>

              <div className="grid gap-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="right_flag_file" className="text-[10px] font-bold text-slate-500">Sağ Bayrak</Label>
                  {rightFlagImage && (
                    <button onClick={() => handleResetImage('right')} className="text-[9px] text-red-500 font-bold hover:underline cursor-pointer bg-transparent border-0 p-0">Sıfırla</button>
                  )}
                </div>
                <Input
                  id="right_flag_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'right')}
                  className="text-[10px] h-8 cursor-pointer file:text-[10px] file:font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="mt-auto border-t pt-4 flex flex-col gap-2">
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full shadow-md gap-1.5 cursor-pointer">
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
              {/* Left Flag (Chad Flag or Custom Image) */}
              <div className="w-12 h-12 rounded-full overflow-hidden flex border border-slate-200 shadow-sm shrink-0 items-center justify-center bg-slate-50">
                {leftFlagImage ? (
                  <img src={leftFlagImage} alt="Sol Bayrak" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="flex-1 h-full bg-[#002664]"></div>
                    <div className="flex-1 h-full bg-[#FECB00]"></div>
                    <div className="flex-1 h-full bg-[#C60C30]"></div>
                  </>
                )}
              </div>
              
              {/* AGD Logo / Center Logo */}
              <div className="flex items-center gap-2">
                {centerLogoImage ? (
                  <img src={centerLogoImage} alt="Orta Logo" className="w-12 h-12 object-contain" />
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {/* Right Flag (Turkish Flag or Custom Image) */}
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-sm flex items-center justify-center bg-[#E30A17] relative">
                {rightFlagImage ? (
                  <img src={rightFlagImage} alt="Sağ Bayrak" className="w-full h-full object-cover" />
                ) : (
                  <svg viewBox="0 0 300 200" width="28" height="28" className="text-white fill-current">
                    <circle cx="100" cy="100" r="50" fill="#FFF"/>
                    <circle cx="112.5" cy="100" r="40" fill="#E30A17"/>
                    <polygon points="145,100 128,109 134,91 118,82 138,82" fill="#FFF" transform="rotate(18 135 100)"/>
                  </svg>
                )}
              </div>
            </div>

            {/* Main Section */}
            <div className="flex-1 flex gap-5 mt-4">
              {/* Left Column: Slaughter Order Box */}
              <div className="w-[120px] border-[3px] border-black p-2 flex flex-col justify-between items-center text-center rounded-sm shrink-0">
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[64px] font-black text-black tracking-tighter uppercase leading-none break-all max-w-[100px]">
                    {slaughterOrder || '1'}
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
