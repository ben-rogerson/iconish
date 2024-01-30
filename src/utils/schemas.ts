/* v8 ignore start */

import { configSchema } from '@/feature/config/schemas'
import z from 'zod'

const viewSchema = z.object({
  doc: z.string(),
  // history: z.union([z.object({}), z.null()]).optional(),
  selection: z
    .union([
      z.object({
        main: z.number(),
        ranges: z.array(z.object({ anchor: z.number(), head: z.number() })),
      }),
      z.null(),
    ])
    .optional(),
})

const svgLogItem = z.object({
  msg: z.string(),
  type: z.enum(['success', 'error', 'debug', 'info', 'data.type']),
})

const svgSchema = z.object({
  // symbolReference: z.string(),
  // symbol: z.string(),
  output: z.string(),
  outputJsx: z.string(),
  original: z.string(),
  log: z.array(svgLogItem).optional(),
})

const editorSchema = z.tuple([
  z.string(),
  z.object({
    title: z.string(),
    isDeleted: z.boolean().default(false),
    svg: svgSchema,
    view: z.union([viewSchema, z.null()]),
  }),
])

const groupSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.number(),
  config: configSchema,
  editors: z.array(editorSchema),
})

const activeGroupIdSchema = z.string()
const groupsSchema = z.array(groupSchema)

const appStateSchema = z.object({
  activeGroupId: activeGroupIdSchema,
  groups: groupsSchema,
})

export {
  appStateSchema,
  editorSchema,
  viewSchema,
  svgSchema,
  svgLogItem,
  groupSchema,
  activeGroupIdSchema,
  groupsSchema,
}
