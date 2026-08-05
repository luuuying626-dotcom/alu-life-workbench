import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "client"), { recursive: true });
await mkdir(path.join(dist, "server"), { recursive: true });

for (const file of ["index.html", "manifest.webmanifest", "sw.js", "app-config.js"]) {
  await cp(path.join(root, file), path.join(dist, "client", file));
}
await cp(path.join(root, "assets"), path.join(dist, "client", "assets"), { recursive: true });
await cp(path.join(root, "cloudflare-worker.mjs"), path.join(dist, "server", "index.js"));

console.log("阿卢工作台 cloud build ready");
