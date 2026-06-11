import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const typecheck = spawnSync(
  process.execPath,
  [join(projectRoot, "node_modules", "typescript", "bin", "tsc"), "--noEmit"],
  {
    cwd: projectRoot,
    stdio: "inherit"
  }
);

if (typecheck.status !== 0) {
  process.exit(typecheck.status ?? 1);
}

const build = spawnSync(process.execPath, [join(projectRoot, "scripts", "run-vite.mjs"), "build"], {
  cwd: projectRoot,
  stdio: "inherit"
});

process.exit(build.status ?? 1);
