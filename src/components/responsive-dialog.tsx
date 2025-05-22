"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useScreenSize } from "@/hooks/useMobile";
import { getSizeClass } from "@/lib/getSizeClass";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
}: ResponsiveDialogProps) {
  const { screenSize } = useScreenSize();

  // This state is needed to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const sizeClass = getSizeClass(screenSize, size);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sizeClass} p-4 sm:p-6 overflow-hidden`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="mt-4 overflow-y-auto max-h-[calc(80vh-8rem)]">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
