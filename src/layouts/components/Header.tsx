import { logoIcon } from '@/lib/icons'
import Link from 'next/link'

export function Header() {
  return (
    <div className="flex items-center justify-between py-10">
      <Link href="/" className="flex gap-x-[0.25em] text-2xl">
        {logoIcon}
        <div>Iconish</div>
      </Link>
      <h1>align and optimize your svg icons</h1>
    </div>
  )
}
