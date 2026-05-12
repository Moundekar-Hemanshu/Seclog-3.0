import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        critical: 'border-red-500/20 bg-red-500/10 text-red-400',
        high: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
        medium: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
        low: 'border-slate-500/20 bg-slate-500/10 text-slate-400',
        processed: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
        pending: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
        flagged: 'border-red-500/20 bg-red-500/10 text-red-400',
        open: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
        investigating: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
        resolved: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
