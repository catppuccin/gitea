#!/usr/bin/env -S deno run -A

import * as path from "std/path";
import * as sass from "sass";
import ctp from "npm:@catppuccin/palette";

const builder = (flavor: string, accent: string) => `
@import "@catppuccin/palette/scss/${flavor}";
$accent: $${accent};
$isDark: ${flavor !== "latte"};
@import "theme";
`;

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

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

Deno.mkdirSync(path.join(__dirname, "dist"), { recursive: true });

const flavors = Object.keys(ctp.variants);
for (const flavor of flavors) {
  for (const accent of accents) {
    const input = builder(flavor, accent);
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

// TODO:
// refactor this part out to a common import, since ctp/ctp & ctp/userstyles
// are both using the same base function
const updateReadme = ({
  readme,
  section,
  newContent,
}: {
  readme: string;
  section: string;
  newContent: string;
}): string => {
  const preamble =
    "<!-- the following section is auto-generated, do not edit -->";
  const startMarker = `<!-- AUTOGEN:${section.toUpperCase()} START -->`;
  const endMarker = `<!-- AUTOGEN:${section.toUpperCase()} END -->`;
  const wrapped = `${startMarker}\n${preamble}\n${newContent}\n${endMarker}`;

  if (!(readme.includes(startMarker) && readme.includes(endMarker))) {
    throw new Error("Markers not found in README.md");
  }

  const pre = readme.split(startMarker)[0];
  const end = readme.split(endMarker)[1];
  return pre + wrapped + end;
};

const readme = Deno.readTextFileSync(path.join(__dirname, "README.md"));
const newcontent = updateReadme({
  readme,
  section: "ini",
  newContent: `
\`\`\`
[ui]
THEMES = ${
    flavors
      .map((f) =>
        accents
          .map((a) => `catppuccin-${f}-${a}`)
          .join(",")
      ).join(",")
  }
\`\`\`
`,
});

Deno.writeTextFileSync(path.join(__dirname, "README.md"), newcontent);
