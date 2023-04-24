import { envSchema } from "../schema";

const _frontendEnv = envSchema.safeParse(import.meta.env);

if (!_frontendEnv.success) {
  console.error("❌ Invalid environment variables:\n");
  throw new Error("Invalid environment variables");
}

export const envs = { ..._frontendEnv.data };
