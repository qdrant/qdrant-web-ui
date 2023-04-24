import { z } from "zod";

export const envSchema = z.object({
  VITE_API_URL: z.string().default("http://localhost:6333"),
});

export type EnvSchema = z.infer<typeof envSchema>;
