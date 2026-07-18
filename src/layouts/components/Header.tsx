import { logoIcon } from '@/lib/icons'
import Link from 'next/link'
import { HeroConveyor } from '@/layouts/components/HeroConveyor'

// Same feather-style 24x24 paths the conveyor uses
const STAR =
  'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z'
const HEART =
  'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
const ZAP = 'M13 2L3 14h9l-1 8 10-12h-9l1-8z'

const iconTransform = (x: number, y: number, size: number, tilt = 0) =>
  `translate(${x} ${y}) rotate(${tilt}) scale(${size / 24}) translate(-12 -12)`

const RoughIcon = (props: {
  d: string
  x: number
  y: number
  size: number
  tilt: number
}) => {
  const t = iconTransform(props.x, props.y, props.size, props.tilt)
  return (
    <g
      className="text-[--text-muted]"
      stroke="currentColor"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
    >
      <path
        d={props.d}
        transform={`${t} translate(1.8 1.8)`}
        opacity="0.3"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={props.d}
        transform={t}
        opacity="0.85"
        strokeDasharray="5 2.5"
        vectorEffect="non-scaling-stroke"
      />
    </g>
  )
}

const CleanIcon = (props: {
  d: string
  x: number
  y: number
  size: number
}) => (
  <path
    d={props.d}
    transform={iconTransform(props.x, props.y, props.size)}
    stroke="currentColor"
    strokeWidth="2"
    vectorEffect="non-scaling-stroke"
  />
)

const Sparkle = (props: { x: number; y: number; r: number }) => {
  const { x, y, r } = props
  return (
    <path
      className="text-[--text-warning]"
      d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}`}
      fill="currentColor"
      stroke="none"
    />
  )
}

const FlowArrow = (props: { className: string }) => (
  <svg
    viewBox="0 0 32 24"
    className={`h-6 w-8 text-[--text-muted] ${props.className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M3 12h17" strokeDasharray="4 3" opacity="0.6" />
    <path d="M21 6l6 6-6 6" />
  </svg>
)

const diagramProps = {
  viewBox: '0 0 120 56',
  className: 'h-auto w-full max-w-[180px] justify-self-center',
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const steps = [
  {
    number: '1',
    title: 'Add your icons',
    text: 'Paste or upload SVGs from anywhere.',
    diagram: (
      <svg {...diagramProps}>
        <RoughIcon d={STAR} x={26} y={31} size={22} tilt={-14} />
        <RoughIcon d={ZAP} x={59} y={25} size={30} tilt={9} />
        <RoughIcon d={HEART} x={92} y={33} size={17} tilt={-7} />
      </svg>
    ),
  },
  {
    number: '2',
    title: 'Align the set',
    text: 'Colors and sizing synced across the set.',
    diagram: (
      <svg {...diagramProps}>
        <g
          className="text-[--page-border]"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 5"
        >
          <path d="M10 16h100" />
          <path d="M10 40h100" />
        </g>
        <g stroke="currentColor" strokeWidth="2">
          <CleanIcon d={STAR} x={32} y={28} size={24} />
          <CleanIcon d={ZAP} x={60} y={28} size={24} />
          <CleanIcon d={HEART} x={88} y={28} size={24} />
        </g>
      </svg>
    ),
  },
  {
    number: '3',
    title: 'Copy clean code',
    text: (
      <>
        <Link
          href="https://github.com/svg/svgo"
          target="_blank"
          className="underline decoration-[--page-border] underline-offset-4 hover:decoration-current"
        >
          SVGO
        </Link>
        -optimized and minified, ready to ship.
      </>
    ),
    diagram: (
      <svg {...diagramProps}>
        <rect
          x="32"
          y="12"
          width="56"
          height="32"
          rx="8"
          className="text-[--page-border]"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <g stroke="currentColor" strokeWidth="2">
          <path d="M52 22l-7 6 7 6" />
          <path d="M68 22l7 6-7 6" />
          <path d="M63 20l-6 16" opacity="0.6" />
        </g>
        <Sparkle x={94} y={12} r={4.5} />
        <Sparkle x={27} y={42} r={3} />
      </svg>
    ),
  },
]

export function Header() {
  return (
    <div className="grid pt-7">
      <div>
        <Link href="/" className="inline-flex items-center gap-x-3">
          <div className="text-4xl sm:text-5xl">{logoIcon}</div>
          <div className="mt-2 font-serif text-3xl italic">Iconish</div>
        </Link>
      </div>
      <div className="relative mb-8 mt-6 grid gap-y-6 lg:mt-8 lg:justify-items-center lg:gap-y-8 lg:text-center">
        <div>
          <div className="-mx-6 w-[calc(100%+3rem)] md:-mx-20 md:w-[calc(100%+10rem)]">
            <HeroConveyor />
          </div>
          <h1 className="-mt-16 font-serif text-[220%] font-semibold leading-[1.05] tracking-tighter [text-shadow:1px_1px_2px_var(--page-bg)] md:text-[340%] lg:text-[440%]">
            Rough <span className="italic">svgs</span> in,
            <span className="block">
              polished <span className="whitespace-nowrap">icon sets</span> out
            </span>
          </h1>
        </div>
        <p className="text-md max-w-[620px] text-[--text-muted] [text-wrap:balance] md:text-lg">
          Give icons copied from design tools a proper finish, no build step
          required.
        </p>
        <div className="relative mt-2 grid max-w-[880px] gap-8 text-center sm:grid-cols-3 lg:mt-4">
          <FlowArrow className="absolute left-1/3 top-[30px] hidden -translate-x-1/2 sm:block" />
          <FlowArrow className="absolute left-2/3 top-[30px] hidden -translate-x-1/2 sm:block" />
          {steps.map(step => (
            <div key={step.number} className="grid content-start gap-y-2">
              {step.diagram}
              <h2 className="mt-1 font-serif text-xl font-semibold leading-[1.2] tracking-tight">
                {step.title}
              </h2>
              <p className="text-sm leading-relaxed text-[--text-muted]">
                {step.text}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-2 flex w-full items-center gap-x-5">
          <div className="h-px flex-1 bg-[--page-border]" />
          <svg
            viewBox="0 0 24 32"
            className="h-8 w-6 text-[--text-muted]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 3v17" strokeDasharray="4 3" opacity="0.6" />
            <path d="M6 20l6 6 6-6" />
          </svg>
          <div className="h-px flex-1 bg-[--page-border]" />
        </div>
        <div className="pointer-events-none">
          <div className="absolute -left-[25%] -top-[5%] z-[-1] h-[400px] w-[50%] -rotate-6 rounded-full bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,rgb(255_252_131_/_20%)_0%,rgb(255_255_255_/0)_100%)] blur-xl dark:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,rgb(155_252_131_/_12%)_0%,rgb(255_255_255_/0)_100%)]" />
          <div className="absolute -left-[20%] -top-[5%] z-[-1] h-[400px] w-full rotate-12 rounded-full bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,rgb(78_161_255_/_12%)_0%,rgb(255_255_255_/0)_100%)] blur-xl dark:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,rgb(22_46_66_/_80%)_0%,rgb(255_255_255_/0)_100%)]" />
        </div>
      </div>
    </div>
  )
}
