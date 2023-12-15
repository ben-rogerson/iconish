/* v8 ignore start */

import type z from "zod";
import type {
  appStateSchema,
  editorSchema,
  groupSchema,
  svgSchema,
  viewSchema,
} from "./schemas";

type AppState = z.infer<typeof appStateSchema>;
type EditorState = z.infer<typeof editorSchema>;
type View = z.infer<typeof viewSchema>;
type Svg = z.infer<typeof svgSchema>;
type Group = z.infer<typeof groupSchema>;

export type { AppState, EditorState, View, Svg, Group };
