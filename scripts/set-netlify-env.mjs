import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";

const raw = readFileSync(".env.local", "utf8");
const vars = {};

for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const m = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (!m) continue;
  let value = m[2].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  vars[m[1]] = value;
}

vars.NEXT_PUBLIC_APP_URL = "https://tagoslo.no";

if (!vars.MODERATION_ADMIN_KEY) {
  vars.MODERATION_ADMIN_KEY = randomBytes(32).toString("hex");
}

const skipEmpty = new Set([
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
]);

const set = [];

for (const [key, value] of Object.entries(vars)) {
  if (!value) continue;
  if (skipEmpty.has(key)) continue;

    execFileSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["netlify", "env:set", key, value, "--context", "production", "--context", "deploy-preview", "--context", "branch-deploy"],
    { stdio: "inherit", shell: process.platform === "win32" },
  );
  set.push(key);
}

console.log(`\nFerdig: ${set.length} variabler satt for production.`);
console.log(set.join(", "));
