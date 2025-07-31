import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [dts({ outDir: "dist" })],
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "@karsten_zhou/utils",
      fileName: "main",
      formats: ["es"],
    },
  },
});
