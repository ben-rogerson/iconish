import { logoIcon } from '@/lib/icons'
import Link from 'next/link'

export function Header() {
  return (
    <div className="grid py-7">
      <Link href="/" className="flex items-center gap-x-[0.35em] text-2xl">
        <div className="text-4xl sm:text-5xl">{logoIcon}</div>
        <div className="mt-1.5">Iconish</div>
      </Link>
      <div className="mb-10 mt-12 space-y-6 rounded border p-10">
        <h1 className="text-[200%] font-semibold leading-tight tracking-tight">
          Align and minify your icon sets for the web
        </h1>
        <div className="max-w-[600px] space-y-4">
          <p>
            Exporting icons as SVG from tools like Figma can be hit or miss. The
            code is messy, and colors may not match.
          </p>
          <p>
            With Iconish, you can quickly tidy and sync your icon sets. Align
            colors, refine paths, and shrink code size for the best possible
            finish.
          </p>
        </div>
      </div>
    </div>
  )
}
