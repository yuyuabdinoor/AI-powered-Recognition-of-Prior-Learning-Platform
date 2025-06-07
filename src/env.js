import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_SECRET: process.env.NODE_ENV === "production" ? z.string() : z.string().optional(),
    AUTH_DISCORD_ID: z.string(),
    AUTH_DISCORD_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    OPENAI_API_KEY: z.string(), // ✅ Add this line
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(), // leave empty or add if needed
  },

  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY, // ✅ Add this too
    NODE_ENV: process.env.NODE_ENV,
  },

  emptyStringAsUndefined: true,
});
