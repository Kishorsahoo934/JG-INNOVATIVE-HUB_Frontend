import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/** Defer main app CSS to break render-blocking chain (app CSS only, not fonts) */
function deferAppCssPlugin() {
  return {
    name: "defer-app-css",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html: string) {
        return html.replace(
          /<link\s+rel="stylesheet"\s+(crossorigin\s+)?href="(\/assets\/[^"]+\.css)"\s*\/?>/gi,
          (_m, _c, href) =>
            `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'" fetchpriority="low" /><noscript><link rel="stylesheet" href="${href}" /></noscript>`
        );
      },
    },
  };
}

/** Inject modulepreload for entry script so the browser starts fetching it from head, shortening the critical request chain (LCP). */
function modulepreloadEntryPlugin() {
  return {
    name: "modulepreload-entry",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html: string) {
        const match = html.match(/<script[^>]+src="(\/assets\/index-[^"]+\.js)"[^>]*>/);
        if (!match) return html;
        const href = match[1];
        const preload = `<link rel="modulepreload" href="${href}">`;
        return html.replace("</head>", `${preload}\n  </head>`);
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5177,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), deferAppCssPlugin(), modulepreloadEntryPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: mode === "production" ? "terser" : "esbuild",
    cssCodeSplit: true,
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) return "react";
          if (id.includes("node_modules/react-router")) return "router";
          if (id.includes("node_modules/@tanstack/react-query")) return "query";
          if (id.includes("node_modules/class-variance-authority") || id.includes("node_modules/clsx") || id.includes("node_modules/tailwind-merge")) return "utils";
          if (id.includes("node_modules/lucide-react")) return "icons";
          if (id.includes("node_modules/recharts")) return "recharts";
          if (id.includes("node_modules/date-fns")) return "date-fns";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
      onwarn(warning, warn) {
        if (warning.code === "UNUSED_EXTERNAL_IMPORT") return;
        warn(warning);
      },
    },
    reportCompressedSize: true,
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}));
