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
  
  const slaughterNumber = (slaughterOrder || '1').toString()
  const isThreeDigits = slaughterNumber.length >= 3
  
  // District/Branch Name with LocalStorage Persistence
  const [districtInput, setDistrictInput] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kurban_card_district') || ''
    }
    return ''
  })

  // Auto District State with LocalStorage Persistence
  const [autoDistrict, setAutoDistrict] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kurban_card_auto_district')
      return stored !== 'false' // default to true
    }
    return true
  })

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
      return localStorage.getItem('kurban_card_left_size') || '60'
    }
    return '60'
  })
  const [centerLogoSize, setCenterLogoSize] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kurban_card_center_size') || '42'
    }
    return '42'
  })
  const [rightFlagSize, setRightFlagSize] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kurban_card_right_size') || '60'
    }
    return '60'
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

  const getAnimalDistrictName = (animal: any) => {
    if (!autoDistrict && districtInput) {
      return districtInput
    }
    
    const shares = animal.shares || []
    if (shares.length === 0) return 'ESENYURT'
    
    const normalizeRef = (ref: string) => {
      if (!ref) return ''
      return ref
        .replace(/İ/g, 'i')
        .replace(/I/g, 'ı')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/Ö/g, 'o')
        .replace(/ü/g, 'u')
        .replace(/Ü/g, 'u')
        .replace(/ç/g, 'c')
        .replace(/Ç/g, 'c')
        .replace(/ş/g, 's')
        .replace(/Ş/g, 's')
        .toLowerCase()
        .trim()
    }
    
    const refs = shares.map((s: any) => normalizeRef(s.reference_name || ''))
    
    // Rule 1: All shareholders SANCAKTEPE AGD
    const allSancaktepe = shares.length > 0 && refs.every((r: string) => r.includes('sancaktepe'))
    if (allSancaktepe) return 'SANCAKTEPE'
    
    // Rule 2: Sultanbeyli AGD reference exists
    const hasSultanbeyli = refs.some((r: string) => r.includes('sultanbeyli'))
    if (hasSultanbeyli) return 'SULTANBEYLİ'
    
    // Rule 3: Beykoz AGD reference exists
    const hasBeykoz = refs.some((r: string) => r.includes('beykoz'))
    if (hasBeykoz) return 'BEYKOZ'
    
    // Rule 4: Default ESENYURT
    return 'ESENYURT'
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
      
      <DialogContent className="w-[95vw] sm:max-w-[950px] max-h-[95vh] overflow-y-auto flex flex-col md:flex-row gap-6 p-6">
        {/* Style block for print layout isolation */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #print-card-area, #print-card-area * {
              visibility: visible !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #print-card-area {
              position: fixed !important;
              left: 50% !important;
              top: 50% !important;
              transform: translate(-50%, -50%) !important;
              width: 270mm !important;
              height: 180mm !important;
              background: white !important;
              margin: 0 !important;
              padding: 15mm 20mm !important;
              box-shadow: none !important;
              border: 3px solid #000000 !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              box-sizing: border-box !important;
            }
            @page {
              size: landscape;
              margin: 0;
            }

            /* Scale up sizes for printing to look exactly like the screen preview */
            .card-left-flag {
              width: 28mm !important;
              height: 28mm !important;
            }
            .card-right-flag {
              width: 28mm !important;
              height: 28mm !important;
            }
            .card-logo-container {
              display: flex !important;
              flex-direction: row !important;
              align-items: center !important;
              gap: 4mm !important;
            }
            .card-center-logo {
              height: 20mm !important;
              object-fit: contain !important;
            }
            .card-district-container {
              border-left: 2px solid #000000 !important;
              padding-left: 3mm !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
            }
            .card-district-text {
              font-size: 13pt !important;
              font-weight: 900 !important;
              line-height: 1.1 !important;
              letter-spacing: 0.05em !important;
              color: #000000 !important;
            }
            .card-slaughter-box {
              width: 60mm !important;
              height: 110mm !important;
              border: 3px solid #000000 !important;
            }
            .card-slaughter-number {
              font-size: 64pt !important;
              font-weight: 900 !important;
              word-break: normal !important;
              overflow-wrap: normal !important;
              white-space: nowrap !important;
            }
            .print-fs-3digit {
              font-size: 44pt !important;
              word-break: normal !important;
              overflow-wrap: normal !important;
              white-space: nowrap !important;
            }
            .card-slaughter-label {
              font-size: 10pt !important;
              font-weight: 800 !important;
            }
            .card-slaughter-country {
              font-size: 12pt !important;
              font-weight: 900 !important;
            }
            .card-share-row {
              border-bottom: 2.5px solid #000000 !important;
              padding-bottom: 1.5mm !important;
              margin-bottom: 1.5mm !important;
            }
            .card-share-number {
              font-size: 13pt !important;
              width: 6mm !important;
            }
            .card-share-name {
              font-size: 15pt !important;
              font-weight: 900 !important;
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

          <div className="flex flex-col gap-3.5 border-t pt-4 max-h-[55vh] overflow-y-auto pr-1">
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
              <Label htmlFor="card_district" className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> İlçe / Şube Adı
              </Label>
              <Input
                id="card_district"
                value={districtInput}
                onChange={(e) => {
                  const val = e.target.value
                  setDistrictInput(val)
                  localStorage.setItem('kurban_card_district', val)
                }}
                placeholder="Örn: BAŞAKŞEHİR ŞUBESİ"
                className="font-bold text-slate-800 uppercase"
                disabled={autoDistrict}
              />
              <div className="flex items-center gap-2 mt-1 select-none">
                <input
                  type="checkbox"
                  id="card_auto_district"
                  checked={autoDistrict}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setAutoDistrict(checked)
                    localStorage.setItem('kurban_card_auto_district', String(checked))
                  }}
                  className="w-4 h-4 text-blue-600 border-slate-350 rounded focus:ring-blue-500 accent-blue-600 cursor-pointer"
                />
                <Label htmlFor="card_auto_district" className="text-[11px] font-bold text-slate-650 cursor-pointer">
                  Otomatik İlçe Tespiti (Referansa Göre)
                </Label>
              </div>
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
              <span className="text-[11px] font-extrabold text-slate-450 uppercase tracking-widest">Görsel Yükle / Değiştir</span>
              
              <div className="grid gap-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="left_flag_file" className="text-[10px] font-bold text-slate-500">Sol Bayrak (Çad)</Label>
                  {leftFlagImage && (
                    <button onClick={() => handleResetImage('left')} className="text-[9px] text-red-555 font-bold hover:underline cursor-pointer bg-transparent border-0 p-0">Sıfırla</button>
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
                  <Label htmlFor="right_flag_file" className="text-[10px] font-bold text-slate-500">Sağ Bayrak (Türkiye)</Label>
                  {rightFlagImage && (
                    <button onClick={() => handleResetImage('right')} className="text-[9px] text-red-555 font-bold hover:underline cursor-pointer bg-transparent border-0 p-0">Sıfırla</button>
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

            {/* Logo and Flag Size Settings */}
            <div className="flex flex-col gap-3 border-t pt-4">
              <span className="text-[11px] font-extrabold text-slate-450 uppercase tracking-widest">Logo & Bayrak Boyutları</span>
              
              <div className="grid gap-1">
                <Label htmlFor="left_flag_size" className="text-[10px] font-bold text-slate-500 flex justify-between">
                  <span>Sol Bayrak Genişliği</span>
                  <span className="text-blue-650">{leftFlagSize}px</span>
                </Label>
                <input
                  id="left_flag_size"
                  type="range"
                  min="20"
                  max="100"
                  value={leftFlagSize}
                  onChange={(e) => {
                    const val = e.target.value
                    setLeftFlagSize(val)
                    localStorage.setItem('kurban_card_left_size', val)
                  }}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="center_logo_size" className="text-[10px] font-bold text-slate-500 flex justify-between">
                  <span>Orta Logo Yüksekliği</span>
                  <span className="text-blue-650">{centerLogoSize}px</span>
                </Label>
                <input
                  id="center_logo_size"
                  type="range"
                  min="20"
                  max="100"
                  value={centerLogoSize}
                  onChange={(e) => {
                    const val = e.target.value
                    setCenterLogoSize(val)
                    localStorage.setItem('kurban_card_center_size', val)
                  }}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="right_flag_size" className="text-[10px] font-bold text-slate-500 flex justify-between">
                  <span>Sağ Bayrak Genişliği</span>
                  <span className="text-blue-650">{rightFlagSize}px</span>
                </Label>
                <input
                  id="right_flag_size"
                  type="range"
                  min="20"
                  max="100"
                  value={rightFlagSize}
                  onChange={(e) => {
                    const val = e.target.value
                    setRightFlagSize(val)
                    localStorage.setItem('kurban_card_right_size', val)
                  }}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
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
            className="w-[520px] h-[360px] bg-white border border-slate-300 rounded-[20px] p-5 flex flex-col justify-between font-sans relative shadow-md shrink-0 select-none bg-white text-black"
          >
            {/* Top Row: Flags and AGD Logo */}
            <div className="flex items-center justify-between w-full border-b-2 border-slate-100 pb-3">
              {/* Left Flag (Chad Flag SVG or Custom Image) */}
              <div 
                className="card-left-flag rounded-full overflow-hidden flex border border-slate-200 shadow-sm shrink-0 items-center justify-center bg-slate-50"
                style={{ width: leftFlagSize + 'px', height: leftFlagSize + 'px' }}
              >
                {leftFlagImage ? (
                  <img src={leftFlagImage} alt="Sol Bayrak" className="w-full h-full object-cover" />
                ) : (
                  <svg viewBox="0 0 3 2" preserveAspectRatio="none" className="w-full h-full object-cover rounded-full">
                    <rect x="0" y="0" width="1" height="2" fill="#002664" />
                    <rect x="1" y="0" width="1" height="2" fill="#FECB00" />
                    <rect x="2" y="0" width="1" height="2" fill="#C60C30" />
                  </svg>
                )}
              </div>
              
              {/* AGD Logo / Center Logo */}
              <div className="card-logo-container flex items-center gap-3 shrink-0">
                <img 
                  src="/agd-logo.png" 
                  alt="AGD Logo" 
                  className="card-center-logo object-contain"
                  style={{ height: centerLogoSize + 'px' }}
                />
                {(() => {
                  const distName = getAnimalDistrictName(animal)
                  if (!distName) return null
                  return (
                    <div className="card-district-container flex flex-col justify-center border-l border-slate-350 pl-2">
                      <span className="card-district-text text-[10px] font-black uppercase tracking-wider text-slate-800 leading-none">
                        {distName}
                      </span>
                    </div>
                  )
                })()}
              </div>

              {/* Right Flag (Turkish Flag SVG or Custom Image) */}
              <div 
                className="card-right-flag rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-sm flex items-center justify-center bg-[#E30A17] relative"
                style={{ width: rightFlagSize + 'px', height: rightFlagSize + 'px' }}
              >
                {rightFlagImage ? (
                  <img src={rightFlagImage} alt="Sağ Bayrak" className="w-full h-full object-cover" />
                ) : (
                  <svg viewBox="0 0 100 100" className="w-full h-full object-cover rounded-full shrink-0">
                    <circle cx="50" cy="50" r="50" fill="#E30A17" />
                    <circle cx="41" cy="50" r="28" fill="#FFF" />
                    <circle cx="48.5" cy="50" r="22.5" fill="#E30A17" />
                    <polygon points="70,50 58,56 62,44 52,38 65,38" fill="#FFF" transform="rotate(18 63 50)"/>
                  </svg>
                )}
              </div>
            </div>

            {/* Main Section */}
            <div className="flex-1 flex gap-5 mt-4">
              {/* Left Column: Slaughter Order Box */}
              <div className="card-slaughter-box w-[120px] border-[3px] border-black p-2 flex flex-col justify-between items-center text-center rounded-[16px] shrink-0">
                <div className="flex-1 w-full flex items-center justify-center">
                  <span className={`card-slaughter-number ${isThreeDigits ? 'text-[42px] print-fs-3digit' : 'text-[64px]'} font-black text-black tracking-tighter uppercase leading-none whitespace-nowrap break-normal`}>
                    {slaughterNumber}
                  </span>
                </div>
                <div className="w-full border-t-[3px] border-black my-2"></div>
                <div className="flex flex-col gap-0.5 uppercase leading-none">
                  <span className="card-slaughter-label text-[7px] font-extrabold tracking-widest text-slate-500">KURBAN {yearInput}</span>
                  <span className="card-slaughter-country text-[8px] font-black tracking-wider text-black mt-1 break-words max-w-[100px]">{regionInput}</span>
                </div>
              </div>

              {/* Right Column: 7 Shareholder rows */}
              <div className="flex-1 flex flex-col justify-between py-0.5">
                {Array.from({ length: 7 }).map((_, idx) => {
                  const share = animal.shares?.[idx]
                  return (
                    <div key={idx} className="card-share-row w-full border-b-[2px] border-black flex items-end pb-0.5 text-black">
                      <span className="card-share-number text-[10px] font-black w-5 text-slate-400 shrink-0">{idx + 1}</span>
                      <span className="card-share-name text-xs font-black tracking-wide uppercase truncate leading-none flex-1">
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
