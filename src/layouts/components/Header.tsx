import { logoIcon } from '@/lib/icons'
import Link from 'next/link'

export function Header() {
  return (
    <div className="grid pt-7">
      <div>
        <Link href="/" className="inline-flex items-center gap-x-3">
          <div className="text-4xl sm:text-5xl">{logoIcon}</div>
          <div className="mt-2 font-serif text-3xl italic">Iconish</div>
        </Link>
      </div>
      <div className="relative mb-10 mt-12 grid space-y-6 rounded lg:place-content-center lg:space-y-10 lg:p-10 lg:px-24 lg:py-12 lg:text-center">
        <h1 className="font-serif text-[250%] font-semibold leading-[1.1] tracking-tighter [text-shadow:1px_1px_2px_var(--page-bg)] md:text-[400%] lg:text-[600%]">
          <span className="block">
            Align <span className="italic">&amp;</span> minify
          </span>
          svg <span className="whitespace-nowrap">icon sets</span>
        </h1>
        <div className="text-md max-w-[710px] space-y-7 md:text-lg lg:text-xl">
          <p>
            Copying SVGs from websites or tools like Figma often lack essential
            optimizations needed for production.
          </p>
          <p>
            Iconish will tidy and sync svg colors, refine paths, and shrink code
            size (with{' '}
            <Link
              href="https://github.com/svg/svgo"
              target="_blank"
              className="underline"
            >
              SVGO
            </Link>
            ) for the best possible finish.
          </p>
        </div>
        <div className="pointer-events-none ">
          <div className="absolute -left-[25%] -top-[1%] z-[-1] h-[500px] w-[50%] -rotate-6 rounded-full bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,rgb(255_252_131_/_25%)_0%,rgb(255_255_255_/0)_100%)] blur-xl dark:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,rgb(155_252_131_/_15%)_0%,rgb(255_255_255_/0)_100%)]" />
          <div className="absolute -left-[20%] -top-[1%] z-[-1] h-[500px] w-full rotate-12 rounded-full bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,rgb(78_161_255_/_15%)_0%,rgb(255_255_255_/0)_100%)] blur-xl dark:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,rgb(22_46_66_/_100%)_0%,rgb(255_255_255_/0)_100%)]" />
        </div>
      </div>
    </div>
  )
}
