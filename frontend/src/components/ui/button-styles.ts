import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export function buttonStyles(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55',
    {
      'bg-brand-600 text-white shadow-sm hover:bg-brand-700': variant === 'primary',
      'border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50':
        variant === 'secondary',
      'text-slate-600 hover:bg-slate-100 hover:text-slate-950': variant === 'ghost',
      'bg-rose-600 text-white hover:bg-rose-700': variant === 'danger',
      'px-3 py-2 text-sm': size === 'sm',
      'px-4 py-2.5 text-sm': size === 'md',
      'px-5 py-3.5 text-base': size === 'lg',
    },
    className,
  )
}
