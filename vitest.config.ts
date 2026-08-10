import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "next/image": fileURLToPath(
        new URL("./test/stubs/next-image.tsx", import.meta.url),
      ),
      "next/navigation": fileURLToPath(
        new URL("./test/stubs/next-navigation.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // Let vite process these packages' prebuilt ESM rather than letting Node
    // resolve them natively, so the aliases above reach their transitive
    // next/image and next/navigation imports.
    server: { deps: { inline: ["@venuecms/sdk-next", "next-intl"] } },
  },
});
