import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.test.ts", "src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      all: true,
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/app.module.ts",
        "src/main.ts",
        "src/**/*.module.ts",
        "src/**/*.controller.ts",
        "src/common/domain/types.ts",
        "src/common/jobs/**",
        "src/common/prisma/**",
        "src/common/auth/jwt-payload.ts"
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 70
      }
    }
  },
  resolve: {
    alias: {
      "@": resolve(process.cwd(), "src")
    }
  }
});
