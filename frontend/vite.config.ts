import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      qrcode: path.resolve(__dirname, "./src/stubs/qrcode.ts"),
    },
  },
  define: {
    global: "window",
    "process.env": {},
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
  },
});
