const fs = require("fs");
const path = require("path");
const sass = require("sass");
const ctp = require("@catppuccin/palette");

const builder = (flavor, accent) => `
@import "@catppuccin/palette/scss/${flavor}";
$accent: $${accent};
$isDark: ${flavor !== "latte"};
@import "theme";
`;

for (const flavor of Object.keys(ctp.variants)) {
  for (const accent of Object.keys(ctp.labels)) {
    const input = builder(flavor, accent);
    const result = sass.compileString(input, {
      loadPaths: [
        path.join(__dirname, "src"),
        path.join(__dirname, "node_modules"),
      ],
    });

    fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true });
    fs.writeFileSync(
      path.join(__dirname, "dist", `theme-catppuccin-${flavor}-${accent}.css`),
      result.css
    );
  }
}
