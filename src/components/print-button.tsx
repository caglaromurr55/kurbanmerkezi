'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

interface PrintButtonProps {
  label?: string
  className?: string
}

export function PrintButton({ label = 'PDF Yazdır', className = '' }: PrintButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={() => window.print()}
      className={`border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold shadow-sm cursor-pointer gap-1.5 print:hidden ${className}`}
    >
      <Printer className="w-4 h-4 text-slate-500" />
      {label}
    </Button>
  )
}
