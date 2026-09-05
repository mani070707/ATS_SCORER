import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { buttonStyles, type ButtonSize, type ButtonVariant } from '@/components/ui/button-styles'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: Props) {
  return (
    <button className={buttonStyles(variant, size, className)} {...props}>
      {children}
    </button>
  )
}
