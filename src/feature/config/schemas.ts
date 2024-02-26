import z from 'zod'

const configSchema = z.object({
  iconSetType: z.enum(['outlined', 'solid']),
  strokeWidth: z.string(),
  stroke: z.string(),
  fill: z.string(),
  strokeLinecap: z.string(),
  strokeLinejoin: z.string(),
  nonScalingStroke: z.boolean(),
  outputJsx: z.boolean(),
  cleanupIds: z.boolean(),
})

export { configSchema }
