#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-env

import { path, sass } from "./deps.ts";

const accents = [
  "rosewater",
  "flamingo",
  "pink",
  "mauve",
  "red",
  "maroon",
  "peach",
  "yellow",
  "green",
  "teal",
  "sky",
  "sapphire",
  "blue",
  "lavender",
];

const flavors = ["latte", "frappe", "macchiato", "mocha"];

const dirname = path.dirname(path.fromFileUrl(import.meta.url));
const builder = (flavor: string, accent: string) => `
@import "catppuccin/${flavor}";
$accent: $${accent};
$isDark: ${flavor !== "latte"};
@import "theme";
`;

for (const flavor of flavors) {
  for (const accent of accents) {
    const input = builder(flavor, accent);
    const result = await sass.compileStringAsync(input, {
      loadPaths: [path.join(dirname, "src")],
    });

    Deno.mkdirSync(path.join(dirname, "dist"), { recursive: true });
    await Deno.writeTextFile(
      path.join(dirname, "dist", `theme-catppuccin-${flavor}-${accent}.css`),
      result.css
    );
  }
}
