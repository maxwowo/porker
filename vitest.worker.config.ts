import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./tests/worker/wrangler.toml" },
    }),
  ],
  test: {
    include: ["tests/worker/**/*.test.ts"],
  },
});
