/* v8 ignore start */

import type z from 'zod'
import type {
  appStateSchema,
  editorSchema,
  groupSchema,
  svgSchema,
  svgLogItem,
  viewSchema,
} from '@/utils/schemas'
import type { iconSetTypeSchema } from '@/feature/config/schemas'

type IconSetType = z.infer<typeof iconSetTypeSchema>
type AppState = z.infer<typeof appStateSchema>
type EditorState = z.infer<typeof editorSchema>
type View = z.infer<typeof viewSchema>
type Svg = z.infer<typeof svgSchema>
type SvgLogItem = z.infer<typeof svgLogItem>
type Group = z.infer<typeof groupSchema>

export type { IconSetType, AppState, EditorState, View, Svg, SvgLogItem, Group }
