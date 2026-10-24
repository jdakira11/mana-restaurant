import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Vista previa estática para GitHub Pages (`npm run deploy:pages`).
 * Sin servidor: no hay API, panel ni base de datos; las reservas funcionan en modo demostración.
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.PAGES_BASE_PATH ?? "";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : []),
];

const turbopack: NextConfig["turbopack"] = {
  rules: {
    "*.css": {
      loaders: ["@tailwindcss/turbopack"],
      as: "*.css",
    },
  },
};

const staticConfig: NextConfig = {
  output: "export",
  // Carpeta propia: no interfiere con la compilación del servidor (.next).
  distDir: "out",
  basePath,
  trailingSlash: true,
  poweredByHeader: false,
  // GitHub Pages no puede optimizar imágenes al vuelo: se sirven las WebP ya optimizadas.
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_STATIC_PREVIEW: "1", NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack,
};

const serverConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // PGlite (base de datos embebida para desarrollo) carga ficheros WASM en tiempo de ejecución.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Garantiza que los binarios de PGlite viajen con las funciones serverless.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/@electric-sql/pglite/dist/*.wasm", "./node_modules/@electric-sql/pglite/dist/*.data"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 82],
  },
  turbopack,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/reservas/gestionar", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default isStaticExport ? staticConfig : serverConfig;
