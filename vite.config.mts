import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

const getCache = ({ name, pattern, maxEntries }: any) => ({
  urlPattern: pattern,
  handler: "StaleWhileRevalidate" as const,
  options: {
    cacheName: name,
    expiration: {
      maxEntries: maxEntries,
      maxAgeSeconds: 60 * 60 * 24 * 365 * 2, // 2 years
    },
    cacheableResponse: {
      statuses: [200],
    },
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "@welldone-software/why-did-you-render", // <-----
    }),
    viteTsconfigPaths(),
    svgrPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        runtimeCaching: [
          getCache({
            pattern: /.*\.(jpg|png)$/,
            name: "local-images",
            maxEntries: 500,
          }),
          getCache({
            pattern: /(.*json_data.*)|(.*\.json$)/,
            name: "local-json",
            maxEntries: 1000,
          }),
          getCache({
            pattern: /.*public\/decklist.*/,
            name: "local-decklists",
            maxEntries: 100,
          }),
        ],
      },
    }),
  ],
});
