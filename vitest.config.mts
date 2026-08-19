import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
    conditions: ["react-server"],
  },
  ssr: {
    resolve: {
      conditions: ["react-server"],
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 20000,
    // Integration tests share one live Postgres pooler connection budget across files;
    // running files in parallel causes transient pool-contention timeouts.
    fileParallelism: false,
  },
});
