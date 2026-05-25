/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// When deploying to GitHub Pages, set `base` to "/megatraveller-chargen/"
// (or whatever the repo is named). For local dev and direct-from-disk
// use, "./" produces relative asset paths and works in both contexts.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
    globals: false,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
