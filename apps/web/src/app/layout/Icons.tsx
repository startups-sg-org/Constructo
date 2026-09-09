import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const iconProps: IconProps = {
  'aria-hidden': true,
  fill: 'none',
  viewBox: '0 0 24 24',
  xmlns: 'http://www.w3.org/2000/svg',
}

export function ConstructoLogo(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d='M3 20h18M6 20V9h8v11M9 9V5h3v4M17 20v-6h3v6' />
      <path d='M2 6h16M5 3h8M14 3l5 3-5 3M4 6v3M8 12h2M8 16h2' />
    </svg>
  )
}

export function ProfileIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d='M4 21a8 8 0 0 1 16 0M8 9a4 4 0 1 0 8 0' />
      <path d='M6 8h12M8 8V6a4 4 0 0 1 8 0v2M12 2v3' />
    </svg>
  )
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d='m3 11 9-8 9 8M5 10v10h14V10M9 20v-6h6v6' />
    </svg>
  )
}

export function MapIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d='m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6ZM9 3v15M15 6v15' />
    </svg>
  )
}

export function IndicatorsIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d='M4 20V10M10 20V4M16 20v-7M22 20H2' />
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <circle cx='11' cy='11' r='7' />
      <path d='m16 16 5 5' />
    </svg>
  )
}

export function ChevronIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d='m9 18 6-6-6-6' />
    </svg>
  )
}
