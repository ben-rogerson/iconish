import z from 'zod'

const iconSetTypeSchema = z.enum(['outlined', 'solid', 'indeterminate'])

const configSchema = z.object({
  iconSetType: iconSetTypeSchema,
  strokeWidth: z.string(),
  stroke: z.string(),
  fill: z.string(),
  strokeLinecap: z.string(),
  strokeLinejoin: z.string(),
  nonScalingStroke: z.boolean(),
  outputJsx: z.boolean(),
  cleanupIds: z.boolean(),
})

export { iconSetTypeSchema, configSchema }
