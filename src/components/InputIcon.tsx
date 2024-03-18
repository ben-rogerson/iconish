import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import type { SVGIconProps } from '@/lib/icons'
import { cn } from '@/lib/utils'

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  startIcon?: (props: SVGIconProps) => JSX.Element
}

const InputIcon = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, ...props }, ref) => {
    const StartIcon = startIcon

    return (
      <div className="relative w-full">
        {StartIcon !== undefined && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transform">
            <StartIcon className="h-[1em] w-[1em] text-2xl text-muted" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-7 py-7 text-xl ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
            startIcon ? 'pl-12' : '',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)

InputIcon.displayName = 'InputIcon'

export { InputIcon }
