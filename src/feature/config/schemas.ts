import z from "zod";

const configSchema = z.object({
  strokeWidth: z.string(),
  stroke: z.string(),
  fill: z.string(),
  strokeLinecap: z.string(),
  strokeLinejoin: z.string(),
});

export { configSchema };
