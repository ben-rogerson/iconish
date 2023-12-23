import z from "zod";

const configSchema = z.object({
  iconSetType: z.enum(["stroked", "filled"]),
  strokeWidth: z.string(),
  stroke: z.string(),
  fill: z.string(),
  strokeLinecap: z.string(),
  strokeLinejoin: z.string(),
  nonScalingStroke: z.boolean(),
});

export { configSchema };
