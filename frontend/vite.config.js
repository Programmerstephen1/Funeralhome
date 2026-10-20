import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const currentRenderOrigin = "https://funeralhome-api.onrender.com";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const canonicalOrigin = new URL(env.VITE_SITE_URL || "http://localhost:4173")
    .origin;

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "canonical-origin",
        transformIndexHtml(html) {
          return html.replaceAll(currentRenderOrigin, canonicalOrigin);
        },
        writeBundle({ dir }) {
          const outputDir = resolve(process.cwd(), dir || "dist");
          for (const filename of ["robots.txt", "sitemap.xml", "llms.txt"]) {
            const file = resolve(outputDir, filename);
            try {
              const content = readFileSync(file, "utf8");
              writeFileSync(
                file,
                content.replaceAll(currentRenderOrigin, canonicalOrigin),
              );
            } catch (error) {
              if (error.code !== "ENOENT") throw error;
            }
          }
        },
      },
    ],
    root: ".",
    server: {
      host: "0.0.0.0",
      port: 4173,
      strictPort: true,
    },
  };
});
