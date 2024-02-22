import { logoIcon } from '@/lib/icons'
import Link from 'next/link'

export function Header() {
  return (
    <div className="grid py-7">
      <div>
        <Link href="/" className="inline-flex items-center gap-x-3">
          <div className="text-4xl sm:text-5xl">{logoIcon}</div>
          <div className="logo mt-1.5 text-3xl italic">Iconish</div>
        </Link>
      </div>
      <div className="relative mb-10 mt-12 space-y-6 rounded lg:space-y-10 lg:p-10 lg:px-24 lg:py-12">
        <h1 className="text-[350%] font-semibold leading-[1.1] tracking-tight xl:text-[500%]">
          <span className="block">
            Align <span className="italic">&amp;</span> minify{' '}
          </span>
          your svg <span className="whitespace-nowrap">icon sets</span>
        </h1>
        <div className="max-w-[600px] space-y-4 text-xl">
          <p>
            Exporting icons as SVG from tools like Figma can be hit or miss. The
            code is messy, and colors may not match.
          </p>
          <p>
            With Iconish, you can quickly tidy and sync all your icons. Align
            colors, refine paths, and shrink code size for the best possible
            finish.
          </p>
        </div>
        <div className="pointer-events-none absolute -left-[20%] -top-[1%] z-[-1] h-[500px] w-full rotate-12 rounded-full opacity-70 blur-xl dark:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,rgba(22,46,66,1)_0%,rgba(255,255,255,0.00)_100%)]" />
      </div>
    </div>
  )
}
