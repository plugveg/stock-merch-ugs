'use client'

import type React from 'react'

import { useScreenSize } from '@/hooks/useMobile'
import { getSizeClass } from '@/lib/getSizeClass'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ResponsiveDialogProps {
  open: boolean
  title: string
  description?: string
  children: React.ReactNode
  onOpenChange: (open: boolean) => void
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function ResponsiveDialog({ children, description, onOpenChange, open, size = 'md', title }: ResponsiveDialogProps) {
  const { screenSize } = useScreenSize()

  const sizeClass = getSizeClass(screenSize, size)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sizeClass} p-4 sm:p-6 overflow-hidden`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="mt-4 overflow-y-auto max-h-[calc(80vh-8rem)]">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
