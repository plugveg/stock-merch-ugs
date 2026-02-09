import type { VariantProps } from 'class-variance-authority'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

import { buttonVariants } from './button-variants'

function Button({
  asChild = false,
  className,
  size,
  variant,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return <Comp data-slot="button" className={cn(buttonVariants({ className, size, variant }))} {...props} />
}

export { Button }
export type { VariantProps }
