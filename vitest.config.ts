import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "next/image": fileURLToPath(
        new URL("./test/stubs/next-image.tsx", import.meta.url),
      ),
    },
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // Let vite process the SDK's prebuilt ESM rather than letting Node resolve
    // it natively, so the alias above reaches its transitive next/image import.
    server: { deps: { inline: ["@venuecms/sdk-next"] } },
  },
});
