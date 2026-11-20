// Turns content.js into the page's HTML at build time, so the story reads (and indexes) without JavaScript.
const { SITES, ERAS, ARC, LAYERS, GUARDRAILS, READING } = require("./content.js");
const { GLOSSARY, CATS } = require("./glossary.js");
const { illo } = require("./illos.js");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// [[key]] / [[key|text]] -> a highlighted term with its category icon, first mention per era only
function jargon(text, seen) {
  return esc(text).replace(/\[\[([a-z0-9]+)(?:\|([^\]]+))?\]\]/g, (_, k, shown) => {
    const g = GLOSSARY[k];
    if (!g) throw new Error("glossary key missing: " + k);
    const label = shown || g[0];
    if (seen.has(k)) return label;
    seen.add(k);
    return `<span class="j" data-k="${k}" tabindex="0" role="button" aria-haspopup="dialog"><svg class="ji" aria-hidden="true"><use href="#i-${g[2]}"/></svg>${label}</span>`;
  });
}

const ext = '<svg class="ext" aria-hidden="true"><use href="#i-ext"/></svg>';

function demoTile(key) {
  const s = SITES[key];
  return `<a class="demo" href="${s.url}" target="_blank" rel="noopener">
    <span class="demo-shot" data-shot="${s.shot}" aria-hidden="true"><span class="shot-fb illo">${illo(s.fb)}</span><span class="demo-play"><svg><use href="#i-play"/></svg></span></span>
    <span class="demo-body"><span class="demo-k">Live visualiser${s.wip ? " · work in progress" : ""}${s.lock ? " · password protected" : ""}</span>
    <span class="demo-name">${esc(s.name)} ${ext}</span>
    <span class="demo-blurb">${esc(s.blurb)}</span>
    <span class="chips">${s.facts.map((f) => `<span class="chip">${esc(f)}</span>`).join("")}</span></span></a>`;
}

function stop(s, side, seen, era) {
  return `<article class="item side ${side} stop${s.demo ? " has-demo" : ""}" id="${s.id}" data-era="${era.id}">
  <div class="lane" aria-hidden="true"><span class="node${s.demo ? " live" : ""}"></span><span class="lane-year">${(String(s.year).match(/\d{4}/) || [""])[0]}</span></div>
  <div class="card">
    <div class="eyebrow"><span class="yr">${esc(s.year)}</span> · ${esc(s.who)}${s.venue ? ` · <em>${esc(s.venue)}</em>` : ""}</div>
    <h3>${esc(s.title)}</h3>
    <div class="vis"><div class="illo">${illo(s.illo)}</div>
      <div class="big"><span class="big-n">${jargon(s.big[0], seen)}</span><span class="big-l">${jargon(s.big[1], seen)}</span></div></div>
    <dl class="bhr">
      <div><dt>Before</dt><dd>${jargon(s.before, seen)}</dd></div>
      <div><dt>The breakthrough</dt><dd>${jargon(s.how, seen)}</dd></div>
      <div><dt>Result</dt><dd>${jargon(s.result, seen)}</dd></div>
    </dl>
    ${s.demo ? demoTile(s.demo) : ""}
    ${s.cite ? `<a class="cite" href="${s.cite[1]}" target="_blank" rel="noopener">${esc(s.cite[0])} ${ext}</a>` : ""}
  </div>
</article>`;
}

function fact(f, side, seen, era) {
  return `<aside class="item side ${side} fact" data-era="${era.id}">
  <div class="lane" aria-hidden="true"><span class="node trib"></span></div>
  <div class="card fact-card"><div class="fact-h"><svg aria-hidden="true"><use href="#i-spark"/></svg>${esc(f.title)}</div>
  <p>${jargon(f.text, seen)}</p>${f.link ? `<a class="cite" href="${f.link[1]}" target="_blank" rel="noopener">${esc(f.link[0])} ${ext}</a>` : ""}</div>
</aside>`;
}

function ticker(x, era) {
  return `<div class="item full ticker" id="ticker" data-era="${era.id}"><div class="ticker-track">${x.rows.map(([y, n, d]) =>
    `<div class="tick-card"><span class="tick-y">${y}</span><span class="tick-n">${esc(n)}</span><span class="tick-d">${esc(d)}</span></div>`).join("")}</div>
    <p class="ticker-note">Scroll sideways · make the text easy for the machine, not the machine good at text</p></div>`;
}

function board(b, era) {
  const lo = 85, hi = 97.2;
  return `<div class="item full board" id="leaders" data-era="${era.id}"><div class="board-in">
  <h3>${esc(b.title)}</h3><p class="board-sub">${esc(b.sub)}</p>
  <div class="bars">${b.rows.map(([n, size, v, star], i) => `<div class="brow${size === "frontier" ? " frontier" : ""}" style="--w:${(((v - lo) / (hi - lo)) * 100).toFixed(1)}%;--i:${i}">
    <span class="bn">${esc(n)} <span class="bs">${esc(size)}</span></span><span class="bt"><span class="bf"></span></span><span class="bv">${v.toFixed(2)}${star ? " *" : ""}</span></div>`).join("")}</div>
  <p class="board-sub">Axis starts at 85. Small specialists sit above frontier general models; no invoices or receipts are in this benchmark.</p></div></div>`;
}

function era(e) {
  const seen = new Set();
  let side = 0;
  const items = e.items.map((x) => {
    if (x.type === "stop") return stop(x, side++ % 2 ? "right" : "left", seen, e);
    if (x.type === "fact") return fact(x, side++ % 2 ? "right" : "left", seen, e);
    if (x.type === "ticker") return ticker(x, e);
    if (x.type === "board") return board(x, e);
    return "";
  }).join("\n");
  return `<section class="era${e.mine ? " mine" : ""}" id="${e.id}" style="--c:${e.color}" data-color="${e.color}">
  <header class="item full era-head" data-era="${e.id}"><div class="era-in">
    <span class="era-num">${e.num}</span><div><p class="era-years">${esc(e.years)}${e.mine ? " · built by lasal.ai" : ""}</p><h2>${esc(e.title)}</h2>
    <p class="era-lede">${jargon(e.lede, seen)}</p></div></div></header>
  ${items}
</section>`;
}

function finale() {
  const seen = new Set();
  return `<section class="finale" id="finale">
  <div class="fin-block" id="arc"><p class="kicker">The arc</p><h2>Every breakthrough deleted one hand-built step</h2>
  <p class="fin-lede">The pattern repeats for a century: something engineers designed by hand becomes something the network learns. The last row is different in kind. The architecture has largely converged (a vision encoder plus a small language decoder), and the progress is now in how the training data and rewards are built. Hover a row to light its stops; click to jump there.</p>
  <div class="arc" role="table">${["When", "Papers", "Hand-built step removed", "Replaced by"].map((h) => `<div class="arc-h" role="columnheader">${h}</div>`).join("")}
  ${ARC.map(([y, p, rm, rep, ids]) => `<div class="arc-row" role="row" tabindex="0" data-stops="${ids.join(",")}"><span role="cell">${esc(y)}</span><span role="cell">${esc(p)}</span><span role="cell" class="rm">${esc(rm)}</span><span role="cell" class="rep">${esc(rep)}</span></div>`).join("")}</div></div>

  <div class="fin-block"><p class="kicker">What it means in practice</p><h2>Use each generation for what it is best at</h2>
  <div class="layers">${LAYERS.map(([n, ex, d, role], i) => `<div class="layer" style="--i:${i}"><p class="layer-role">${esc(role)}</p><h3>${esc(n)}</h3><p class="layer-ex">${esc(ex)}</p><p>${esc(d)}</p></div>`).join("")}</div>
  <div class="guard"><h3><svg aria-hidden="true"><use href="#i-shield"/></svg>Guardrails for generative OCR</h3><ul>${GUARDRAILS.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>
  <p class="guard-end">Public benchmarks pick the candidates. Only your own documents, scored field by field, pick the winner.</p></div></div>

  <div class="fin-block" id="lab"><p class="kicker">The lab</p><h2>Ten visualisers, one story</h2>
  <p class="fin-lede">Each stop above links to a working, in-browser visualiser. Here they all are, in reading order.</p>
  <div class="lab">${["mnist", "crnn", "tesseract", "transformer", "paddle", "llm", "qwen", "legacy", "sota", "wsp"].map((k, i) => { const s = SITES[k];
    return `<a class="lab-card" href="${s.url}" target="_blank" rel="noopener"><span class="lab-i">${String(i + 1).padStart(2, "0")}</span><span class="lab-shot" data-shot="${s.shot}" aria-hidden="true"><span class="shot-fb illo">${illo(s.fb)}</span></span>${s.lock ? '<span class="lab-lock">password protected</span>' : ""}<span class="lab-n">${esc(s.name)} ${ext}</span><span class="lab-b">${esc(s.blurb)}</span></a>`; }).join("")}</div></div>

  <div class="fin-block" id="reading"><p class="kicker">Reading list</p><h2>The papers behind it</h2>
  <ol class="reading">${READING.map(([y, n, u]) => `<li><span>${y}</span><a href="${u}" target="_blank" rel="noopener">${esc(n)} ${ext}</a></li>`).join("")}</ol>
  <p class="fin-note">Figures are as reported in each paper. Most 2025 and 2026 benchmark numbers are self-reported by the model authors. All diagrams on this page are original drawings, not reproductions of the papers' figures.</p></div>
</section>`;
}

function minimap() {
  return `<nav class="minimap" aria-label="Eras">${ERAS.map((e) => `<a href="#${e.id}" data-era="${e.id}" style="--c:${e.color}"><span class="mm-dot"></span><span class="mm-t">${e.num} ${esc(e.title)}</span></a>`).join("")}
  <a href="#finale" data-era="finale" style="--c:var(--ochre)"><span class="mm-dot"></span><span class="mm-t">The arc</span></a></nav>`;
}

function render() {
  const papers = ERAS.reduce((n, e) => n + e.items.filter((x) => x.type === "stop" && !e.mine).length, 0);
  return { road: ERAS.map(era).join("\n"), finale: finale(), minimap: minimap(), papers, glossary: GLOSSARY, cats: CATS };
}
module.exports = { render };
