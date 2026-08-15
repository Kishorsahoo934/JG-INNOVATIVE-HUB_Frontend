// vite.config.ts
import { defineConfig } from "file:///D:/innovative-hub/innovative-frontend/node_modules/vite/dist/node/index.js";
import react from "file:///D:/innovative-hub/innovative-frontend/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///D:/innovative-hub/innovative-frontend/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "D:\\innovative-hub\\innovative-frontend";
function deferAppCssPlugin() {
  return {
    name: "defer-app-css",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        return html.replace(
          /<link\s+rel="stylesheet"\s+(crossorigin\s+)?href="(\/assets\/[^"]+\.css)"\s*\/?>/gi,
          (_m, _c, href) => `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'" fetchpriority="low" /><noscript><link rel="stylesheet" href="${href}" /></noscript>`
        );
      }
    }
  };
}
function modulepreloadEntryPlugin() {
  return {
    name: "modulepreload-entry",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        const match = html.match(/<script[^>]+src="(\/assets\/index-[^"]+\.js)"[^>]*>/);
        if (!match) return html;
        const href = match[1];
        const preload = `<link rel="modulepreload" href="${href}">`;
        return html.replace("</head>", `${preload}
  </head>`);
      }
    }
  };
}
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5177,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger(), deferAppCssPlugin(), modulepreloadEntryPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
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
        assetFileNames: "assets/[name]-[hash][extname]"
      },
      onwarn(warning, warn) {
        if (warning.code === "UNUSED_EXTERNAL_IMPORT") return;
        warn(warning);
      }
    },
    reportCompressedSize: true
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : []
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxpbm5vdmF0aXZlLWh1YlxcXFxpbm5vdmF0aXZlLWZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxpbm5vdmF0aXZlLWh1YlxcXFxpbm5vdmF0aXZlLWZyb250ZW5kXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9pbm5vdmF0aXZlLWh1Yi9pbm5vdmF0aXZlLWZyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vKiogRGVmZXIgbWFpbiBhcHAgQ1NTIHRvIGJyZWFrIHJlbmRlci1ibG9ja2luZyBjaGFpbiAoYXBwIENTUyBvbmx5LCBub3QgZm9udHMpICovXHJcbmZ1bmN0aW9uIGRlZmVyQXBwQ3NzUGx1Z2luKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiBcImRlZmVyLWFwcC1jc3NcIixcclxuICAgIGFwcGx5OiBcImJ1aWxkXCIsXHJcbiAgICB0cmFuc2Zvcm1JbmRleEh0bWw6IHtcclxuICAgICAgb3JkZXI6IFwicG9zdFwiLFxyXG4gICAgICBoYW5kbGVyKGh0bWw6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoXHJcbiAgICAgICAgICAvPGxpbmtcXHMrcmVsPVwic3R5bGVzaGVldFwiXFxzKyhjcm9zc29yaWdpblxccyspP2hyZWY9XCIoXFwvYXNzZXRzXFwvW15cIl0rXFwuY3NzKVwiXFxzKlxcLz8+L2dpLFxyXG4gICAgICAgICAgKF9tLCBfYywgaHJlZikgPT5cclxuICAgICAgICAgICAgYDxsaW5rIHJlbD1cInByZWxvYWRcIiBocmVmPVwiJHtocmVmfVwiIGFzPVwic3R5bGVcIiBvbmxvYWQ9XCJ0aGlzLm9ubG9hZD1udWxsO3RoaXMucmVsPSdzdHlsZXNoZWV0J1wiIGZldGNocHJpb3JpdHk9XCJsb3dcIiAvPjxub3NjcmlwdD48bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIiR7aHJlZn1cIiAvPjwvbm9zY3JpcHQ+YFxyXG4gICAgICAgICk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH07XHJcbn1cclxuXHJcbi8qKiBJbmplY3QgbW9kdWxlcHJlbG9hZCBmb3IgZW50cnkgc2NyaXB0IHNvIHRoZSBicm93c2VyIHN0YXJ0cyBmZXRjaGluZyBpdCBmcm9tIGhlYWQsIHNob3J0ZW5pbmcgdGhlIGNyaXRpY2FsIHJlcXVlc3QgY2hhaW4gKExDUCkuICovXHJcbmZ1bmN0aW9uIG1vZHVsZXByZWxvYWRFbnRyeVBsdWdpbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogXCJtb2R1bGVwcmVsb2FkLWVudHJ5XCIsXHJcbiAgICBhcHBseTogXCJidWlsZFwiLFxyXG4gICAgdHJhbnNmb3JtSW5kZXhIdG1sOiB7XHJcbiAgICAgIG9yZGVyOiBcInBvc3RcIixcclxuICAgICAgaGFuZGxlcihodG1sOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBtYXRjaCA9IGh0bWwubWF0Y2goLzxzY3JpcHRbXj5dK3NyYz1cIihcXC9hc3NldHNcXC9pbmRleC1bXlwiXStcXC5qcylcIltePl0qPi8pO1xyXG4gICAgICAgIGlmICghbWF0Y2gpIHJldHVybiBodG1sO1xyXG4gICAgICAgIGNvbnN0IGhyZWYgPSBtYXRjaFsxXTtcclxuICAgICAgICBjb25zdCBwcmVsb2FkID0gYDxsaW5rIHJlbD1cIm1vZHVsZXByZWxvYWRcIiBocmVmPVwiJHtocmVmfVwiPmA7XHJcbiAgICAgICAgcmV0dXJuIGh0bWwucmVwbGFjZShcIjwvaGVhZD5cIiwgYCR7cHJlbG9hZH1cXG4gIDwvaGVhZD5gKTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDUxNzcsXHJcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxyXG4gICAgcHJveHk6IHtcclxuICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo1MDAwJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW3JlYWN0KCksIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKSwgZGVmZXJBcHBDc3NQbHVnaW4oKSwgbW9kdWxlcHJlbG9hZEVudHJ5UGx1Z2luKCldLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgbWluaWZ5OiBtb2RlID09PSBcInByb2R1Y3Rpb25cIiA/IFwidGVyc2VyXCIgOiBcImVzYnVpbGRcIixcclxuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcclxuICAgIHRhcmdldDogXCJlczIwMjBcIixcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzOiAoaWQpID0+IHtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9yZWFjdC9cIikgfHwgaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXMvcmVhY3QtZG9tL1wiKSkgcmV0dXJuIFwicmVhY3RcIjtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9yZWFjdC1yb3V0ZXJcIikpIHJldHVybiBcInJvdXRlclwiO1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzL0B0YW5zdGFjay9yZWFjdC1xdWVyeVwiKSkgcmV0dXJuIFwicXVlcnlcIjtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9jbGFzcy12YXJpYW5jZS1hdXRob3JpdHlcIikgfHwgaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXMvY2xzeFwiKSB8fCBpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy90YWlsd2luZC1tZXJnZVwiKSkgcmV0dXJuIFwidXRpbHNcIjtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9sdWNpZGUtcmVhY3RcIikpIHJldHVybiBcImljb25zXCI7XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXMvcmVjaGFydHNcIikpIHJldHVybiBcInJlY2hhcnRzXCI7XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXMvZGF0ZS1mbnNcIikpIHJldHVybiBcImRhdGUtZm5zXCI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjaHVua0ZpbGVOYW1lczogXCJhc3NldHMvW25hbWVdLVtoYXNoXS5qc1wiLFxyXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0tW2hhc2hdLmpzXCIsXHJcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IFwiYXNzZXRzL1tuYW1lXS1baGFzaF1bZXh0bmFtZV1cIixcclxuICAgICAgfSxcclxuICAgICAgb253YXJuKHdhcm5pbmcsIHdhcm4pIHtcclxuICAgICAgICBpZiAod2FybmluZy5jb2RlID09PSBcIlVOVVNFRF9FWFRFUk5BTF9JTVBPUlRcIikgcmV0dXJuO1xyXG4gICAgICAgIHdhcm4od2FybmluZyk7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IHRydWUsXHJcbiAgfSxcclxuICBlc2J1aWxkOiB7XHJcbiAgICBkcm9wOiBtb2RlID09PSBcInByb2R1Y3Rpb25cIiA/IFtcImNvbnNvbGVcIiwgXCJkZWJ1Z2dlclwiXSA6IFtdLFxyXG4gIH0sXHJcbn0pKTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1UyxTQUFTLG9CQUFvQjtBQUNwVSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBTXpDLFNBQVMsb0JBQW9CO0FBQzNCLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLG9CQUFvQjtBQUFBLE1BQ2xCLE9BQU87QUFBQSxNQUNQLFFBQVEsTUFBYztBQUNwQixlQUFPLEtBQUs7QUFBQSxVQUNWO0FBQUEsVUFDQSxDQUFDLElBQUksSUFBSSxTQUNQLDZCQUE2QixJQUFJLDZIQUE2SCxJQUFJO0FBQUEsUUFDdEs7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQUdBLFNBQVMsMkJBQTJCO0FBQ2xDLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLG9CQUFvQjtBQUFBLE1BQ2xCLE9BQU87QUFBQSxNQUNQLFFBQVEsTUFBYztBQUNwQixjQUFNLFFBQVEsS0FBSyxNQUFNLHFEQUFxRDtBQUM5RSxZQUFJLENBQUMsTUFBTyxRQUFPO0FBQ25CLGNBQU0sT0FBTyxNQUFNLENBQUM7QUFDcEIsY0FBTSxVQUFVLG1DQUFtQyxJQUFJO0FBQ3ZELGVBQU8sS0FBSyxRQUFRLFdBQVcsR0FBRyxPQUFPO0FBQUEsVUFBYTtBQUFBLE1BQ3hEO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQUdBLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxpQkFBaUIsZ0JBQWdCLEdBQUcsa0JBQWtCLEdBQUcseUJBQXlCLENBQUMsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUMvSCxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRLFNBQVMsZUFBZSxXQUFXO0FBQUEsSUFDM0MsY0FBYztBQUFBLElBQ2QsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYyxDQUFDLE9BQU87QUFDcEIsY0FBSSxHQUFHLFNBQVMscUJBQXFCLEtBQUssR0FBRyxTQUFTLHlCQUF5QixFQUFHLFFBQU87QUFDekYsY0FBSSxHQUFHLFNBQVMsMkJBQTJCLEVBQUcsUUFBTztBQUNyRCxjQUFJLEdBQUcsU0FBUyxvQ0FBb0MsRUFBRyxRQUFPO0FBQzlELGNBQUksR0FBRyxTQUFTLHVDQUF1QyxLQUFLLEdBQUcsU0FBUyxtQkFBbUIsS0FBSyxHQUFHLFNBQVMsNkJBQTZCLEVBQUcsUUFBTztBQUNuSixjQUFJLEdBQUcsU0FBUywyQkFBMkIsRUFBRyxRQUFPO0FBQ3JELGNBQUksR0FBRyxTQUFTLHVCQUF1QixFQUFHLFFBQU87QUFDakQsY0FBSSxHQUFHLFNBQVMsdUJBQXVCLEVBQUcsUUFBTztBQUFBLFFBQ25EO0FBQUEsUUFDQSxnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsT0FBTyxTQUFTLE1BQU07QUFDcEIsWUFBSSxRQUFRLFNBQVMseUJBQTBCO0FBQy9DLGFBQUssT0FBTztBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxzQkFBc0I7QUFBQSxFQUN4QjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTSxTQUFTLGVBQWUsQ0FBQyxXQUFXLFVBQVUsSUFBSSxDQUFDO0FBQUEsRUFDM0Q7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
