/* v8 ignore start */

import z from "zod";

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
});

const svgSchema = z.object({
  // symbolReference: z.string(),
  // symbol: z.string(),
  output: z.string(),
  original: z.string(),
});

const editorSchema = z.tuple([
  z.string(),
  z.object({
    title: z.string(),
    svg: svgSchema,
    view: z.union([viewSchema, z.null()]),
  }),
]);

const groupSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.number(),
  config: z.object({
    strokeWidth: z.string(),
    stroke: z.string(),
    fill: z.string(),
    strokeLinecap: z.string(),
    strokeLinejoin: z.string(),
  }),
  editors: z.array(editorSchema),
});

const activeGroupIdSchema = z.string();
const groupsSchema = z.array(groupSchema);

const appStateSchema = z.object({
  activeGroupId: activeGroupIdSchema,
  groups: groupsSchema,
});

export {
  appStateSchema,
  editorSchema,
  viewSchema,
  svgSchema,
  groupSchema,
  activeGroupIdSchema,
  groupsSchema,
};
