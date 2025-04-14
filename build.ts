#!/usr/bin/env -S deno run -A

import * as path from "@std/path";
import * as sass from "sass";
import { flavorEntries, flavors } from "@catppuccin/palette";
import { updateReadme } from "@catppuccin/deno-lib";

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
const accents = flavors.mocha.colorEntries
  .filter(([_, { accent }]) => accent)
  .map(([accentName]) => accentName);

Deno.mkdirSync(path.join(__dirname, "dist"), { recursive: true });

const sassBuilder = (flavor: string, accent: string) => `
@import "@catppuccin/palette/scss/${flavor}";
$accent: $${accent};
$isDark: ${flavor !== "latte"};
@import "theme";
`;

flavorEntries.forEach(([flavorName, flavor]) => {
  flavor.colorEntries
    .filter(([_, { accent }]) => accent)
    .forEach(([accentName]) => {
      const input = sassBuilder(flavorName, accentName);
      const result = sass.compileString(input, {
        loadPaths: [
          path.join(__dirname, "src"),
          path.join(__dirname, "node_modules"),
        ],
      });

      Deno.writeTextFileSync(
        path.join(
          __dirname,
          "dist",
          `theme-catppuccin-${flavorName}-${accentName}.css`,
        ),
        result.css,
      );

      Deno.writeTextFileSync(
        path.join(__dirname, "dist", `theme-catppuccin-${accentName}-auto.css`),
        `@import "./theme-catppuccin-latte-${accentName}.css" (prefers-color-scheme: light);
@import "./theme-catppuccin-mocha-${accentName}.css" (prefers-color-scheme: dark);`,
      );
    });
});

const flavorAccentIni = `
\`\`\`ini
[ui]
THEMES = ${
  flavorEntries
    .map(([f]) => accents.map((a) => `catppuccin-${f}-${a}`).join(","))
    .join(",")
}
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
