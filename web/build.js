// Builds public/index.html: renders content.js to HTML (web/render.js) and inlines the CSS, JS, glossary and logo.
// Visualiser preview images are used when public/shots/<key>.jpg exists (captured by tools/shots.js, checked by eye).
// Usage: node web/build.js
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), read = (f) => fs.readFileSync(path.join(__dirname, f), "utf8"), esc = (s) => s.replace(/<\/script/gi, "<\/script");
const { render } = require("./render.js");
const { DEFS } = require("./illos.js");
const R = render();
const logo = read("logo.svg").trim();
const shotDir = path.join(root, "public", "shots");
const withShots = (html) => html.replace(/data-shot="([a-z]+)"/g, (m, k) => fs.existsSync(path.join(shotDir, k + ".jpg")) ? `${m} style="background-image:url(shots/${k}.jpg)"` : m);
let page = read("index.src.html")
  .replace("/*CSS*/", () => read("case.css"))
  .replace("/*FAVICON*/", "data:image/svg+xml," + encodeURIComponent(logo))
  .replace("<!--LOGO-->", logo.replace("<svg ", '<svg aria-hidden="true" '))
  .replace("<!--ILLO_DEFS-->", DEFS)
  .replace("<!--MINIMAP-->", () => R.minimap)
  .replace("<!--ROAD-->", () => withShots(R.road))
  .replace("<!--FINALE-->", () => withShots(R.finale))
  .replace("/*PAPERS*/", String(R.papers))
  .replace("/*GLOSSARY*/null", () => esc(JSON.stringify(R.glossary)))
  .replace("/*CATS*/null", () => esc(JSON.stringify(R.cats)))
  .replace("/*JS*/", () => esc(read("case.js")));
const split = page.indexOf('<div class="page">');
fs.mkdirSync(path.join(root, "public"), { recursive: true });
fs.writeFileSync(path.join(root, "public", "index.html"), `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${page.slice(0, split)}</head>\n<body>\n${page.slice(split)}</body>\n</html>\n`);
fs.copyFileSync(path.join(__dirname, "logo.svg"), path.join(root, "public", "logo.svg"));
const terms = (page.match(/class="j"/g) || []).length;
console.log("public/index.html", Math.round(fs.statSync(path.join(root, "public", "index.html")).size / 1024), "KB ·", R.papers, "breakthroughs ·", terms, "highlighted terms");
