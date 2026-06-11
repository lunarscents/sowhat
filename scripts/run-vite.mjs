import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cleanRoot = join(tmpdir(), "so-what-vite-root");
const command = process.argv[2] === "preview" ? "preview" : process.argv[2] === "build" ? "build" : "dev";
const args = process.argv
  .slice(command === "dev" ? 2 : 3)
  .filter((arg) => arg !== "--");

if (command !== "preview") {
  rmSync(cleanRoot, { recursive: true, force: true });
  mkdirSync(cleanRoot, { recursive: true });
  for (const entry of ["index.html", "package.json", "pnpm-lock.yaml", "vite.config.ts", "src"]) {
    cpSync(join(projectRoot, entry), join(cleanRoot, entry), {
      recursive: true,
      dereference: true,
      verbatimSymlinks: false
    });
  }
  const install = spawnSync("corepack", ["pnpm", "install", "--prefer-offline"], {
    cwd: cleanRoot,
    stdio: "inherit",
    env: process.env
  });
  if (install.status !== 0) {
    process.exit(install.status ?? 1);
  }
}

if (command === "preview") {
  rmSync(cleanRoot, { recursive: true, force: true });
  mkdirSync(cleanRoot, { recursive: true });
  for (const entry of ["package.json", "pnpm-lock.yaml", "dist"]) {
    if (existsSync(join(projectRoot, entry))) {
      cpSync(join(projectRoot, entry), join(cleanRoot, entry), {
        recursive: true,
        dereference: true,
        verbatimSymlinks: false
      });
    }
  }
  const install = spawnSync("corepack", ["pnpm", "install", "--prefer-offline"], {
    cwd: cleanRoot,
    stdio: "inherit",
    env: process.env
  });
  if (install.status !== 0) {
    process.exit(install.status ?? 1);
  }
}

const viteBin = join(cleanRoot, "node_modules", "vite", "bin", "vite.js");
const result = spawnSync(process.execPath, [viteBin, command, ...args], {
  cwd: cleanRoot,
  stdio: "inherit",
  env: process.env
});

if (command === "build" && result.status === 0) {
  rmSync(join(projectRoot, "dist"), { recursive: true, force: true });
  cpSync(join(cleanRoot, "dist"), join(projectRoot, "dist"), { recursive: true });
}

process.exit(result.status ?? 1);
