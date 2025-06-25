import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_SECRET: process.env.NODE_ENV === "production" ? z.string() : z.string().optional(),
    AUTH_DISCORD_ID: z.string(),
    AUTH_DISCORD_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    OPENAI_API_KEY: z.string(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    KNOWLEDGE_QUESTIONS_COUNT: z.coerce.number().default(8),
    SCENARIO_QUESTIONS_COUNT: z.coerce.number().default(5),
    PASS_THRESHOLD: z.coerce.number().default(6),
    THIRDWEB_CLIENT_ID: z.string(),
    THIRDWEB_SECRET_KEY: z.string(),
    CERT_CONTRACT_ADDRESS: z.string(),
  },

  client: {
    NEXT_PUBLIC_PASS_THRESHOLD: z.coerce.number().default(6),
  },

  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    KNOWLEDGE_QUESTIONS_COUNT: process.env.KNOWLEDGE_QUESTIONS_COUNT,
    SCENARIO_QUESTIONS_COUNT: process.env.SCENARIO_QUESTIONS_COUNT,
    PASS_THRESHOLD: process.env.PASS_THRESHOLD,
    NEXT_PUBLIC_PASS_THRESHOLD: process.env.NEXT_PUBLIC_PASS_THRESHOLD,
    THIRDWEB_CLIENT_ID: process.env.THIRDWEB_CLIENT_ID,
    THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY,
    CERT_CONTRACT_ADDRESS: process.env.CERT_CONTRACT_ADDRESS,
  },

  emptyStringAsUndefined: true,
});
