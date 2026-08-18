import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  process.loadEnvFile(path.resolve(dirname, "../.env"));
} catch {
  // .env may already be loaded by the environment (e.g. CI) — ignore if missing.
}
