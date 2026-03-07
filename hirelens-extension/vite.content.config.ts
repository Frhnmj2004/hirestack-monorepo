/// <reference types="node" />
/**
 * Build content script as a single IIFE file (no ES module imports).
 * Chrome content scripts run as classic scripts unless type: "module" is set;
 * type: "module" + chunk loading is unreliable in extension context, so we
 * bundle everything into one IIFE (like Sider.ai / Parakeet-style extensions).
 */
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROCESS_SHIM = "var process = typeof process !== 'undefined' ? process : { env: { NODE_ENV: 'production' } };";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "prepend-process-shim",
      generateBundle(_, bundle) {
        for (const name of Object.keys(bundle)) {
          if (name.endsWith(".js")) {
            const chunk = bundle[name];
            if (chunk && typeof chunk === "object" && "code" in chunk) {
              (chunk as { code: string }).code = PROCESS_SHIM + "\n" + (chunk as { code: string }).code;
            }
          }
        }
      },
    },
  ],
  root: __dirname,
  base: "./",
  define: {
    // Most specific first — Vite/Rollup replace processes longer keys first
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": JSON.stringify({ NODE_ENV: "production" }),
    // Catch any remaining bare `process` references (e.g. in React internals)
    "process": JSON.stringify({ env: { NODE_ENV: "production" } }),
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/content/index.tsx"),
      name: "HireLensContent",
      fileName: () => "content.js",
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "content.js",
        format: "iife",
        inlineDynamicImports: true,
      },
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
});
