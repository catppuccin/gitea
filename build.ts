#!/usr/bin/env -S deno run -A

import * as path from "std/path";
import * as sass from "sass";
import ctp from "npm:@catppuccin/palette";
import { updateReadme } from "@catppuccin/deno-lib";

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
const flavors = Object.keys(ctp.variants);
const accents = Object.keys(ctp.labels).slice(0, 14);

Deno.mkdirSync(path.join(__dirname, "dist"), { recursive: true });

const sassBuilder = (flavor: string, accent: string) => `
@import "@catppuccin/palette/scss/${flavor}";
$accent: $${accent};
$flavor: ${flavor};
$isDark: ${flavor !== "latte"};
@import "theme";
`;

for (const flavor of flavors) {
  for (const accent of accents) {
    const input = sassBuilder(flavor, accent);
    const result = sass.compileString(input, {
      loadPaths: [
        path.join(__dirname, "src"),
        path.join(__dirname, "node_modules"),
      ],
    });

    Deno.writeTextFileSync(
      path.join(__dirname, "dist", `theme-catppuccin-${flavor}-${accent}.css`),
      result.css,
    );
  }
}

for (const accent of accents) {
  Deno.writeTextFileSync(
    path.join(__dirname, "dist", `theme-catppuccin-${accent}-auto.css`),
    `@import "./theme-catppuccin-latte-${accent}.css" (prefers-color-scheme: light);
@import "./theme-catppuccin-mocha-${accent}.css" (prefers-color-scheme: dark);`,
  );
}

const flavorAccentIni = `
\`\`\`ini
[ui]
THEMES = ${flavors
  .map((f) => accents.map((a) => `catppuccin-${f}-${a}`).join(","))
  .join(",")}
\`\`\`
`;

const themeAutoIni = `
\`\`\`ini
[ui]
THEMES = ${accents.map((a) => `catppuccin-${a}-auto`).join(",")}
\`\`\`
`;

const oldReadme = Deno.readTextFileSync(path.join(__dirname, "README.md"));
let newReadme = updateReadme(oldReadme, flavorAccentIni, {
  section: "ini",
});
newReadme = updateReadme(newReadme, themeAutoIni, {
  section: "ini-auto",
});
Deno.writeTextFileSync(path.join(__dirname, "README.md"), newReadme);
