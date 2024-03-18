import type { SVGProps } from 'react'

/**
 * Common svg icon wrapper.
 */
const Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
    {...props}
  >
    {props.children}
  </svg>
)

export interface SVGIconProps {
  className?: string
}

export const iconBarrier = (
  <Icon>
    <rect
      x="2"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
      y="6"
      width="20"
      height="8"
      rx="1"
    />
    <path
      d="M17 14v7"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
      stroke="currentColor"
    />
    <path
      d="M7 14v7"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
      stroke="currentColor"
    />
    <path
      d="M17 3v3"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
      stroke="currentColor"
    />
    <path
      d="M7 3v3"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
      stroke="currentColor"
    />
    <path
      d="M10 14 2.3 6.3"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
      stroke="currentColor"
    />
    <path
      d="m14 6 7.7 7.7"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
      stroke="currentColor"
    />
    <path
      d="m8 6 8 8"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
      stroke="currentColor"
    />
  </Icon>
)

export const logoIcon = (
  <Icon viewBox="0 0 61 40" strokeWidth="2.25" className="h-[1em] w-[1em]">
    <path
      stroke="currentColor"
      d="M2.298 24.182C17.494 8.736 32.311-.645 58.787 23.06c-8.242 13.064-31.492 25.866-56.489 1.122Z"
      vectorEffect="non-scaling-stroke"
    />
    <path
      stroke="currentColor"
      d="M2.298 24.154C27 12.5 31.5 12 58.786 23.032"
      vectorEffect="non-scaling-stroke"
    />
    <path
      stroke="currentColor"
      d="M42.901 17.149a13.7 13.7 0 0 1 1.826 6.578c.15 7.582-5.873 13.85-13.454 14s-13.85-5.873-14-13.454a13.67 13.67 0 0 1 1.89-7.233"
      vectorEffect="non-scaling-stroke"
    />
    <circle
      cx="31"
      cy="24"
      r="5.354"
      stroke="currentColor"
      vectorEffect="non-scaling-stroke"
    />
    <path
      stroke="currentColor"
      d="M7.757 18.5 3 15m49 2.5 4.5-4.5M15 13 9 7m16 2-2-8m11 8 1-8m8 11 4-8"
      vectorEffect="non-scaling-stroke"
    />
  </Icon>
)

export const flyaway = `<svg id="burd" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>`

export const crossIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[1em] w-[1em]"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

export const uploadIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[1em] w-[1em]"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
)

export const SearchIcon = (props: SVGIconProps) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="8" vectorEffect="non-scaling-stroke" />
    <path d="m21 21-4.3-4.3" vectorEffect="non-scaling-stroke" />
  </Icon>
)
