import { type Config } from '@/feature/config/types'

export const initialConfig = {
  iconSetType: 'outlined',
  strokeWidth: '2',
  stroke: 'currentColor',
  fill: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  nonScalingStroke: true,
  outputJsx: false,
  cleanupIds: true,
} as const satisfies Config
