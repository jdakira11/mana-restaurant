// Publica una vista previa estática en GitHub Pages (rama gh-pages).
//
//   npm run deploy:pages            → genera y publica
//   npm run deploy:pages -- --local → solo genera la carpeta out/ (para revisarla en local)
//
// La vista previa no tiene servidor: se excluyen la API, el panel y la gestión de reservas,
// y el formulario de reservas funciona en modo demostración (no guarda ni envía nada).
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const localOnly = process.argv.includes("--local");
const run = (cmd, opts = {}) => execSync(cmd, { stdio: "inherit", ...opts });
const read = (cmd) => execSync(cmd, { encoding: "utf8" }).trim();

const remote = read("git remote get-url origin");
const match = remote.match(/github\.com[/:]([^/]+)\/([^/.]+)(\.git)?$/);
if (!match) throw new Error(`No se reconoce el remoto de GitHub: ${remote}`);
const [, owner, repo] = match;
const basePath = `/${repo}`;
const siteUrl = `https://${owner.toLowerCase()}.github.io${basePath}`;

// Partes que requieren servidor: se apartan durante la compilación y se restauran siempre.
const serverOnly = ["src/app/api", "src/app/admin", "src/app/(site)/reservas", "src/components/admin", "src/proxy.ts", "src/app/robots.ts", "src/app/sitemap.ts"];
const backup = path.join(root, ".static-export-backup");
if (existsSync(backup)) throw new Error(`Existe ${backup}: restaura su contenido en src/ antes de continuar.`);
mkdirSync(backup);
const moved = [];

try {
  for (const rel of serverOnly) {
    const from = path.join(root, rel);
    if (!existsSync(from)) continue;
    const to = path.join(backup, rel.replace(/[\\/]/g, "__"));
    renameSync(from, to);
    moved.push([from, to]);
  }
  rmSync(path.join(root, "out"), { recursive: true, force: true });
  console.log(`\n▶ Compilando vista previa estática para ${siteUrl}\n`);
  run("npx next build", {
    env: { ...process.env, STATIC_EXPORT: "1", PAGES_BASE_PATH: basePath, NEXT_PUBLIC_SITE_URL: siteUrl },
  });
} finally {
  for (const [from, to] of moved.reverse()) renameSync(to, from);
  rmSync(backup, { recursive: true, force: true });
  // La compilación estática deja tipos de rutas sin el panel: se regeneran con el proyecto completo.
  execSync("npx next typegen", { stdio: "ignore" });
}

const out = path.join(root, "out");
if (existsSync(path.join(out, "admin"))) throw new Error("La exportación contiene /admin: no se publica.");
writeFileSync(path.join(out, ".nojekyll"), "");

// Next 16 guarda los datos de precarga de rutas en carpetas (`__next.<segmento>/…/__PAGE__.txt`),
// pero el navegador los pide con los segmentos unidos por puntos (`__next.<segmento>.….__PAGE__.txt`).
// Sin servidor que traduzca la ruta, se crean copias con el nombre que se pide.
function flattenSegmentData(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("__next.")) {
      for (const rel of readdirSync(full, { recursive: true })) {
        const src = path.join(full, rel);
        if (statSync(src).isFile()) copyFileSync(src, path.join(dir, `${entry.name}.${rel.split(path.sep).join(".")}`));
      }
    } else {
      flattenSegmentData(full);
    }
  }
}
flattenSegmentData(out);
// robots.txt y sitemap.xml estáticos (las rutas dinámicas equivalentes requieren servidor).
writeFileSync(path.join(out, "robots.txt"), ["User-agent: *", "Allow: /", "", `Sitemap: ${siteUrl}/sitemap.xml`, ""].join("\n"));
const pages = ["", "privacidad/", "aviso-legal/", "creditos/"];
writeFileSync(
  path.join(out, "sitemap.xml"),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...pages.map((p) => `  <url><loc>${siteUrl}/${p}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n"),
);

if (localOnly) {
  console.log(`\n✓ Vista previa generada en out/ (ruta base ${basePath}).`);
  process.exit(0);
}

console.log("\n▶ Publicando en la rama gh-pages…\n");
rmSync(path.join(out, ".git"), { recursive: true, force: true });
const git = (args) => run(`git ${args}`, { cwd: out });
git("init -q -b gh-pages");
git("add -A");
git(`-c user.name="${owner}" -c user.email="${owner}@users.noreply.github.com" commit -q -m "Vista previa estática (${new Date().toISOString()})"`);
git(`push -q --force "${remote}" gh-pages`);
rmSync(path.join(out, ".git"), { recursive: true, force: true });
console.log(`\n✓ Publicado. Enlace: ${siteUrl}/`);
