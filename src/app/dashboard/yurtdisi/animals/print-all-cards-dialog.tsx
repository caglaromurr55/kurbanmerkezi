'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Globe, Calendar, Layers, Tag } from 'lucide-react'
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
  const [startSequence, setStartSequence] = useState('1')

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

  // Logo Size States (in pixels) with LocalStorage Persistence
  const [leftFlagSize, setLeftFlagSize] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kurban_card_left_size') || '48'
    }
    return '48'
  })
  const [centerLogoSize, setCenterLogoSize] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kurban_card_center_size') || '48'
    }
    return '48'
  })
  const [rightFlagSize, setRightFlagSize] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kurban_card_right_size') || '48'
    }
    return '48'
  })

  // Synchronize custom images & sizes if modal opens/reopens (syncs with single card dialog selections)
  const syncFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      setLeftFlagImage(localStorage.getItem('kurban_card_left_flag'))
      setCenterLogoImage(localStorage.getItem('kurban_card_center_logo'))
      setRightFlagImage(localStorage.getItem('kurban_card_right_flag'))
      setLeftFlagSize(localStorage.getItem('kurban_card_left_size') || '48')
      setCenterLogoSize(localStorage.getItem('kurban_card_center_size') || '48')
      setRightFlagSize(localStorage.getItem('kurban_card_right_size') || '48')
    }
  }

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
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (val) syncFromLocalStorage()
    }}>
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
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
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
              width: 270mm !important;
              height: 180mm !important;
              margin: 15mm auto !important;
              padding: 15mm 20mm !important;
              box-sizing: border-box !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              background: white !important;
              page-break-after: always !important;
              break-after: page !important;
              border: 3px solid #000000 !important;
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
                <Printer className="w-5 h-5 text-emerald-600" /> Toplu Kart Yazdır
              </DialogTitle>
              <DialogDescription>
                Tüm yurtdışı kurbanlıkların kartlarını tek seferde toplu olarak yazdırın.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex flex-col gap-3.5 border-t pt-4 max-h-[55vh] overflow-y-auto pr-1">
            <div className="grid gap-1.5">
              <Label htmlFor="global_start_sequence" className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Başlangıç Kesim Sırası
              </Label>
              <Input
                id="global_start_sequence"
                value={startSequence}
                onChange={(e) => setStartSequence(e.target.value)}
                placeholder="Örn: 1"
                className="font-bold text-slate-800"
              />
            </div>

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

            {/* Custom Logo and Flag Upload Area */}
            <div className="flex flex-col gap-3 border-t pt-4">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Görsel Yükle / Özelleştir</span>
              
              <div className="grid gap-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="global_left_flag_file" className="text-[10px] font-bold text-slate-500">Sol Bayrak</Label>
                  {leftFlagImage && (
                    <button onClick={() => handleResetImage('left')} className="text-[9px] text-red-500 font-bold hover:underline cursor-pointer bg-transparent border-0 p-0">Sıfırla</button>
                  )}
                </div>
                <Input
                  id="global_left_flag_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'left')}
                  className="text-[10px] h-8 cursor-pointer file:text-[10px] file:font-semibold"
                />
              </div>

              <div className="grid gap-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="global_center_logo_file" className="text-[10px] font-bold text-slate-500">Orta Logo</Label>
                  {centerLogoImage && (
                    <button onClick={() => handleResetImage('center')} className="text-[9px] text-red-500 font-bold hover:underline cursor-pointer bg-transparent border-0 p-0">Sıfırla</button>
                  )}
                </div>
                <Input
                  id="global_center_logo_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'center')}
                  className="text-[10px] h-8 cursor-pointer file:text-[10px] file:font-semibold"
                />
              </div>

              <div className="grid gap-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="global_right_flag_file" className="text-[10px] font-bold text-slate-500">Sağ Bayrak</Label>
                  {rightFlagImage && (
                    <button onClick={() => handleResetImage('right')} className="text-[9px] text-red-500 font-bold hover:underline cursor-pointer bg-transparent border-0 p-0">Sıfırla</button>
                  )}
                </div>
                <Input
                  id="global_right_flag_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'right')}
                  className="text-[10px] h-8 cursor-pointer file:text-[10px] file:font-semibold"
                />
              </div>
            </div>

            {/* Logo and Flag Size Settings */}
            <div className="flex flex-col gap-3 border-t pt-4">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Logo & Bayrak Boyutları</span>
              
              <div className="grid gap-1">
                <Label htmlFor="global_left_flag_size" className="text-[10px] font-bold text-slate-500 flex justify-between">
                  <span>Sol Bayrak Genişliği</span>
                  <span className="text-emerald-600">{leftFlagSize}px</span>
                </Label>
                <input
                  id="global_left_flag_size"
                  type="range"
                  min="20"
                  max="100"
                  value={leftFlagSize}
                  onChange={(e) => {
                    const val = e.target.value
                    setLeftFlagSize(val)
                    localStorage.setItem('kurban_card_left_size', val)
                  }}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="global_center_logo_size" className="text-[10px] font-bold text-slate-500 flex justify-between">
                  <span>Orta Logo Genişliği</span>
                  <span className="text-emerald-600">{centerLogoSize}px</span>
                </Label>
                <input
                  id="global_center_logo_size"
                  type="range"
                  min="20"
                  max="120"
                  value={centerLogoSize}
                  onChange={(e) => {
                    const val = e.target.value
                    setCenterLogoSize(val)
                    localStorage.setItem('kurban_card_center_size', val)
                  }}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="global_right_flag_size" className="text-[10px] font-bold text-slate-500 flex justify-between">
                  <span>Sağ Bayrak Genişliği</span>
                  <span className="text-emerald-600">{rightFlagSize}px</span>
                </Label>
                <input
                  id="global_right_flag_size"
                  type="range"
                  min="20"
                  max="100"
                  value={rightFlagSize}
                  onChange={(e) => {
                    const val = e.target.value
                    setRightFlagSize(val)
                    localStorage.setItem('kurban_card_right_size', val)
                  }}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="mt-auto border-t pt-4 flex flex-col gap-2">
            <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold w-full shadow-md gap-1.5 cursor-pointer">
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
              // Calculate sequential slaughter order (slaughter sequence)
              const startNum = parseInt(startSequence) || 1
              const currentOrder = startNum + cardIdx

              return (
                <div 
                  key={animal.id}
                  className="print-card-page w-[520px] h-[360px] bg-white border border-slate-300 rounded-lg p-5 flex flex-col justify-between font-sans relative shadow-md shrink-0 select-none text-black mb-2"
                >
                  {/* Top Row: Flags and AGD Logo */}
                  <div className="flex items-center justify-between w-full border-b-2 border-slate-100 pb-3">
                    {/* Left Flag (Chad Flag SVG or Custom Image) */}
                    <div 
                      className="rounded-full overflow-hidden flex border border-slate-200 shadow-sm shrink-0 items-center justify-center bg-slate-50"
                      style={{ width: leftFlagSize + 'px', height: leftFlagSize + 'px' }}
                    >
                      {leftFlagImage ? (
                        <img src={leftFlagImage} alt="Sol Bayrak" className="w-full h-full object-cover" />
                      ) : (
                        <svg viewBox="0 0 3 2" className="w-full h-full object-cover rounded-full">
                          <rect x="0" y="0" width="1" height="2" fill="#002664" />
                          <rect x="1" y="0" width="1" height="2" fill="#FECB00" />
                          <rect x="2" y="0" width="1" height="2" fill="#C60C30" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Center Logo (AGD or Custom Image) */}
                    <div className="flex items-center gap-2 shrink-0">
                      {centerLogoImage ? (
                        <img 
                          src={centerLogoImage} 
                          alt="Orta Logo" 
                          className="object-contain" 
                          style={{ width: centerLogoSize + 'px', height: centerLogoSize + 'px' }}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <svg 
                            viewBox="0 0 100 100" 
                            className="text-blue-600 fill-none stroke-current shrink-0"
                            style={{ width: centerLogoSize + 'px', height: centerLogoSize + 'px' }}
                          >
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
                      )}
                    </div>

                    {/* Right Flag (Turkish Flag SVG or Custom Image) */}
                    <div 
                      className="rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-sm flex items-center justify-center bg-[#E30A17] relative"
                      style={{ width: rightFlagSize + 'px', height: rightFlagSize + 'px' }}
                    >
                      {rightFlagImage ? (
                        <img src={rightFlagImage} alt="Sağ Bayrak" className="w-full h-full object-cover" />
                      ) : (
                        <svg viewBox="0 0 100 100" className="w-full h-full object-cover rounded-full shrink-0">
                          <circle cx="50" cy="50" r="50" fill="#E30A17" />
                          <circle cx="43" cy="50" r="23" fill="#FFF" />
                          <circle cx="49" cy="50" r="18.5" fill="#E30A17" />
                          <polygon points="68,50 59,54.5 62.5,45.5 54.5,41 64.5,41" fill="#FFF" transform="rotate(18 63 50)"/>
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
                          {currentOrder}
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
