import { type z } from "zod";
import { type configSchema } from "./schemas";

type Config = z.infer<typeof configSchema>;

export type { Config };
