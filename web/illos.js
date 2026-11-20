// Original animated illustrations, one per stop. Each returns an SVG string (viewBox 240x150).
// currentColor is the era colour; --ink / --soft / --line come from the page. Animations are CSS classes
// (see case.css, "illustrations") that only run once the stop has scrolled into view.
const W = 240, H = 150;
const svg = (body, label) => `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">${body}</svg>`;
const r = (x, y, w, h, a = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${a}/>`;
const t = (x, y, s, a = "") => `<text x="${x}" y="${y}" ${a}>${s}</text>`;
const d = (i, base = 0.12) => `style="--d:${(base * i).toFixed(2)}s"`;
const arrow = (x1, y1, x2, y2, a = "") => `<path d="M${x1} ${y1}L${x2} ${y2}" class="ln" marker-end="url(#ah)" ${a}/>`;
const range = (n) => Array.from({ length: n }, (_, i) => i);

// a 7x7 "A" and a few glyph bitmaps
const A7 = ["0011100", "0110110", "1100011", "1100011", "1111111", "1100011", "1100011"];

const I = {
  shift: () => {
    const grid = (ox, oy, sx) => range(49).map((i) => r(ox + (i % 7) * 9, oy + Math.floor(i / 7) * 9, 8, 8, 'class="px"')).join("") +
      `<g class="a-slide" style="--sx:${sx}px">${r(ox + 9, oy + 27, 26, 8, 'class="hot"')}</g>`;
    return svg(grid(14, 30, 18) + t(46, 112, "stroke here", 'class="cap" text-anchor="middle"') +
      arrow(84, 60, 116, 60) + `<circle cx="140" cy="60" r="13" class="node a-pulse"/>` + t(140, 112, "same C-cell fires", 'class="cap" text-anchor="middle"') +
      arrow(160, 60, 184, 60) + t(208, 68, "A", 'class="big" text-anchor="middle"'), "A stroke moves across a grid but the same shift-tolerant cell keeps firing");
  },
  conv: () => {
    const cells = range(49).map((i) => r(14 + (i % 7) * 12, 24 + Math.floor(i / 7) * 12, 11, 11, `class="${A7[Math.floor(i / 7)][i % 7] === "1" ? "ink" : "px"}"`)).join("");
    const out = range(25).map((i) => r(150 + (i % 5) * 14, 38 + Math.floor(i / 5) * 14, 12, 12, `class="fm a-light" ${d(i, 0.16)}`)).join("");
    return svg(cells + `<rect x="14" y="24" width="35" height="35" class="kern a-scan"/>` + arrow(108, 72, 140, 72) + out +
      t(56, 120, "5x5 shared kernel", 'class="cap" text-anchor="middle"') + t(184, 120, "feature map", 'class="cap" text-anchor="middle"'), "One shared kernel slides over a pixel A and fills a feature map");
  },
  spline: () => {
    const hs = [26, 18, 22, 14, 20, 24, 16, 22, 18, 26, 20, 16];
    const base = (i) => 96 + 12 * Math.sin((i / 11) * Math.PI - 0.2) - 8;
    const bars = hs.map((h, i) => r(18 + i * 17, base(i) - h, 11, h, `class="ink a-light" ${d(i, 0.05)}`)).join("");
    return svg(bars + `<path d="M14 92 L226 92" class="dash"/>` +
      `<path d="M14 86 Q120 124 226 84" class="curve a-draw"/>` + [14, 84, 156, 226].map((x, i) => `<circle cx="${x}" cy="${[86, 101, 101, 84][i]}" r="3.5" class="dot"/>`).join("") +
      t(120, 26, "a quadratic spline per line", 'class="cap" text-anchor="middle"') + t(120, 138, "no de-skewing of the page", 'class="cap soft" text-anchor="middle"'), "A curved baseline is followed by a spline instead of a straight line");
  },
  lenet: () => {
    const layer = (x, n, s, i) => range(n).map((k) => r(x + k * 4, 75 - s / 2 - k * 4, s, s, `class="${i % 2 ? "fm" : "lay"} a-fade" ${d(i, 0.25)}`)).join("");
    const outs = range(10).map((k) => `<circle cx="216" cy="${30 + k * 10}" r="3.4" class="${k === 7 ? "node a-pulse" : "px"}"/>`).join("");
    return svg(r(10, 51, 48, 48, 'class="px"') + t(34, 82, "7", 'class="big" text-anchor="middle"') +
      layer(68, 6, 40, 1) + layer(110, 6, 24, 2) + layer(142, 4, 18, 3) + layer(172, 3, 12, 4) + outs +
      t(120, 140, "convolve, subsample, repeat", 'class="cap" text-anchor="middle"'), "Feature maps shrink layer by layer into ten outputs");
  },
  bars: () => {
    const rows = [["linear", 12.0], ["k-NN", 1.1], ["LeNet-5", 0.95], ["SVM", 0.68], ["GPU nets", 0.23], ["ensemble", 0.13]];
    const sc = (v) => 14 + 118 * (Math.log10(v) + 1) / (Math.log10(12) + 1);
    return svg(rows.map(([n, v], i) => t(56, 24 + i * 20, n, 'class="cap" text-anchor="end"') +
      r(62, 15 + i * 20, sc(v), 12, `class="${i === 2 ? "hotbar" : "bar"} a-grow" ${d(i)}`) + t(66 + sc(v), 25 + i * 20, v + "%", 'class="cap"')).join("") +
      t(120, 144, "test error, log scale", 'class="cap soft" text-anchor="middle"'), "MNIST error falling from 12 percent to 0.13 percent");
  },
  ctc: () => {
    const lab = ["-", "C", "A", "T"], path = [0, 1, 1, 0, 2, 2, 2, 0, 3, 0];
    const dots = range(40).map((i) => `<circle cx="${40 + (i % 10) * 19}" cy="${20 + Math.floor(i / 10) * 22}" r="2.6" class="px"/>`).join("");
    const pl = path.map((l, i) => `${40 + i * 19},${20 + l * 22}`).join(" ");
    return svg(lab.map((l, i) => t(22, 24 + i * 22, l, 'class="mono" text-anchor="middle"')).join("") + dots +
      `<polyline points="${pl}" class="curve a-draw"/>` + path.map((l, i) => `<circle cx="${40 + i * 19}" cy="${20 + l * 22}" r="3.6" class="dot a-light" ${d(i, 0.12)}/>`).join("") +
      t(110, 122, "- C C - A A A - T -", 'class="mono soft" text-anchor="middle"') + t(110, 142, "merge repeats, drop blanks: CAT", 'class="cap" text-anchor="middle"'), "A CTC path through the trellis collapses to the word CAT");
  },
  synth: () => {
    const st = ["font", "border", "colour", "warp", "blend"];
    const box = (i) => {
      const tr = i >= 3 ? 'transform="skewX(-14) translate(14 0)"' : "";
      return `<g class="a-fade" ${d(i, 0.3)}><g transform="translate(${8 + i * 46} 48)"><g ${tr}>` +
        r(0, 0, 40, 26, `class="${i >= 2 ? "fm" : "lay"}" ${i >= 1 ? 'stroke-width="2"' : ""}`) +
        t(20, 17, "read", `class="mono" text-anchor="middle" ${i >= 4 ? 'opacity=".6"' : ""}`) + `</g></g>` + t(28 + i * 46, 96, st[i], 'class="cap" text-anchor="middle"') + `</g>`;
    };
    return svg(range(5).map(box).join("") + t(120, 130, "the rendered word is the label", 'class="cap soft" text-anchor="middle"'), "A word rendered through five distortion stages");
  },
  crnn: () => {
    const cols = range(14).map((i) => r(22 + i * 14, 92, 11, 16, `class="fm a-light" ${d(i, 0.08)}`)).join("");
    const g = "-SS-TT-A--TTE-".split("").map((c, i) => t(27.5 + i * 14, 80, c, 'class="mono small" text-anchor="middle"')).join("");
    return svg(r(18, 112, 200, 30, 'class="px"') + t(118, 133, "STATE", 'class="hand" text-anchor="middle"') + cols +
      `<rect x="18" y="62" width="14" height="82" class="kern a-scanx"/>` + `<path d="M22 56 H214" class="ln" marker-end="url(#ah)" marker-start="url(#ah)"/>` + g +
      t(118, 30, "STATE", 'class="big" text-anchor="middle"') + t(118, 46, "BiLSTM, then CTC", 'class="cap soft" text-anchor="middle"'), "Columns of a word image are read as a sequence");
  },
  lstm: () => {
    const g = range(12).map((i) => r(24 + i * 16, 80, 10, 22, 'class="ink"')).join("");
    return svg(r(14, 72, 212, 38, 'class="px"') + g + `<rect x="20" y="70" width="18" height="42" class="kern a-scanx"/>` +
      `<path d="M220 52 H22" class="ln a-draw" marker-end="url(#ah)"/>` + t(120, 46, "reversed LSTM", 'class="cap" text-anchor="middle"') +
      `<path d="M22 124 H220" class="ln a-draw" marker-end="url(#ah)"/>` + t(120, 140, "forward LSTM", 'class="cap" text-anchor="middle"') +
      t(120, 24, "-EE--n--c--yy--c--l--o-", 'class="mono small soft" text-anchor="middle"'), "Forward and reverse LSTMs run along a text line");
  },
  east: () => {
    const pts = range(18).map((i) => [62 + (i % 6) * 22, 66 + Math.floor(i / 6) * 12]);
    return svg(`<g transform="rotate(-8 120 78)">` + r(50, 56, 140, 44, 'class="box a-fade" style="--d:1.2s"') +
      pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="2.6" class="dot a-light" ${d(i, 0.05)}/>`).join("") +
      `<path d="M106 78 V56 M106 78 V100 M106 78 H50 M106 78 H190" class="ray a-fade" style="--d:.9s"/>` + `</g>` +
      t(120, 132, "every pixel: score, 4 distances, angle", 'class="cap" text-anchor="middle"'), "Each pixel predicts the distances to its text box");
  },
  stn: () => svg(`<g class="a-unwarp">` + range(5).map((i) => `<path d="M${40 + i * 40} 30 V120" class="grid"/>`).join("") +
    range(4).map((i) => `<path d="M40 ${30 + i * 30} H200" class="grid"/>`).join("") + t(120, 84, "text", 'class="big" text-anchor="middle"') + `</g>` +
    t(120, 144, "a learned warp straightens the input", 'class="cap" text-anchor="middle"'), "A warped grid is straightened by a learned transform"),
  aster: () => {
    const cps = range(5).map((i) => [40 + i * 40, 52 - 18 * Math.sin((i / 4) * Math.PI)]);
    return svg(`<defs><path id="arc" d="M30 78 Q120 22 210 78"/></defs>` +
      `<g class="a-out"><text class="big"><textPath href="#arc" startOffset="50%" text-anchor="middle">CURVED</textPath></text>` + cps.map(([x, y]) => `<circle cx="${x}" cy="${y + 8}" r="3" class="dot"/>`).join("") + `</g>` +
      `<g class="a-in">${t(120, 110, "CURVED", 'class="big" text-anchor="middle"')}<path d="M40 118 H200" class="curve"/></g>` +
      t(120, 142, "thin-plate spline, then attention", 'class="cap soft" text-anchor="middle"'), "Curved text is flattened before it is read");
  },
  craft: () => {
    const xs = [44, 82, 120, 158, 196];
    return svg(`<defs><radialGradient id="gb"><stop offset="0" stop-color="currentColor" stop-opacity=".9"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="ga"><stop offset="0" stop-color="#f6ad55" stop-opacity=".9"/><stop offset="1" stop-color="#f6ad55" stop-opacity="0"/></radialGradient></defs>` +
      xs.map((x, i) => `<circle cx="${x}" cy="66" r="20" fill="url(#gb)" class="a-pulse" ${d(i, 0.2)}/>`).join("") +
      xs.slice(0, 4).map((x, i) => `<circle cx="${x + 19}" cy="66" r="11" fill="url(#ga)" class="a-pulse" ${d(i + 0.5, 0.2)}/>`).join("") +
      "CRAFT".split("").map((c, i) => t(xs[i], 74, c, 'class="big" text-anchor="middle"')).join("") +
      t(120, 120, "character regions", 'class="cap" text-anchor="middle"') + t(120, 138, "and the links between them", 'class="cap hot2" text-anchor="middle"'), "Heatmaps for each character and for the links between characters");
  },
  stages: () => {
    const S = [["TPS", "none"], ["ResNet", "VGG"], ["BiLSTM", "none"], ["Attn", "CTC"]], N = ["transform", "features", "sequence", "predict"];
    return svg(S.map(([a, b], i) => `<g transform="translate(${10 + i * 57} 44)">` + r(0, 0, 50, 40, 'class="lay"') +
      `<g class="a-swapA">${t(25, 25, a, 'class="mono small" text-anchor="middle"')}</g><g class="a-swapB">${t(25, 25, b, 'class="mono small" text-anchor="middle"')}</g>` +
      t(25, 58, N[i], 'class="cap" text-anchor="middle"') + `</g>`).join("") + range(3).map((i) => arrow(61 + i * 57, 64, 66 + i * 57, 64)).join("") +
      t(120, 132, "every combination, one protocol", 'class="cap soft" text-anchor="middle"'), "Four recogniser stages with swappable options");
  },
  dbnet: () => svg(`<defs><filter id="bl"><feGaussianBlur stdDeviation="5"/></filter></defs>` +
    r(8, 34, 68, 64, 'class="px"') + `<g filter="url(#bl)">${r(16, 50, 52, 12, 'class="hotbar"')}${r(16, 72, 40, 12, 'class="hotbar"')}</g>` +
    r(86, 34, 68, 64, 'class="px"') + `<rect x="92" y="46" width="56" height="20" class="ring a-pulse"/><rect x="92" y="68" width="44" height="20" class="ring a-pulse" style="--d:.3s"/>` +
    r(164, 34, 68, 64, 'class="px"') + `<g class="a-fade" style="--d:.8s">${r(172, 50, 52, 12, 'class="ink"')}${r(172, 72, 40, 12, 'class="ink"')}</g>` +
    t(42, 116, "probability", 'class="cap" text-anchor="middle"') + t(120, 116, "learned threshold", 'class="cap" text-anchor="middle"') + t(198, 116, "boxes", 'class="cap" text-anchor="middle"') +
    t(120, 140, "P is all that runs at inference", 'class="cap soft" text-anchor="middle"'), "A probability map, a learned threshold map and the resulting boxes"),
  attn: () => {
    const xs = range(6).map((i) => 30 + i * 36), w = ["The", "total", "is", "due", "on", "receipt"];
    const lines = [];
    xs.forEach((x1, i) => xs.forEach((x2, j) => { if ((i + j) % 2 === 0 || i === 1) lines.push(`<path d="M${x1} 46 C${x1} 80 ${x2} 70 ${x2} 104" class="thread a-flick" style="--d:${((i * 6 + j) % 7) * 0.2}s;--o:${i === 1 && j === 5 ? 0.95 : 0.35}"/>`); }));
    return svg(lines.join("") + xs.map((x, i) => r(x - 16, 28, 32, 18, 'class="lay"') + t(x, 41, w[i], 'class="mono small" text-anchor="middle"') +
      r(x - 16, 104, 32, 18, 'class="lay"') + t(x, 117, w[i], 'class="mono small" text-anchor="middle"')).join("") +
      t(120, 142, "every token attends to every token", 'class="cap soft" text-anchor="middle"'), "Attention lines connecting every word to every other word");
  },
  vit: () => {
    const p = range(16).map((i) => { const gx = 16 + (i % 4) * 16, gy = 36 + Math.floor(i / 4) * 16, tx = 104 + (i % 8) * 16, ty = 56 + Math.floor(i / 8) * 26;
      return `<g class="a-fly" style="--dx:${tx - gx}px;--dy:${ty - gy}px;--d:${(i * 0.06).toFixed(2)}s">${r(gx, gy, 14, 14, `class="${[5, 6, 9, 10].includes(i) ? "fm" : "lay"}"`)}</g>`; }).join("");
    return svg(r(14, 34, 68, 68, 'class="px"') + p + t(48, 124, "image", 'class="cap" text-anchor="middle"') + t(168, 124, "16 patch tokens, one sequence", 'class="cap" text-anchor="middle"'), "An image is cut into patches that become a sequence of tokens");
  },
  trocr: () => {
    const pts = range(8).map((i) => r(14 + i * 26, 100, 22, 22, 'class="lay"')).join("");
    const words = ["In", "voice", "To", "tal"];
    return svg(pts + words.map((w, i) => `<g class="a-fade" ${d(i, 0.5)}>` + r(30 + i * 48, 24, 42, 20, 'class="fm"') + t(51 + i * 48, 38, w, 'class="mono small" text-anchor="middle"') +
      `<path d="M${51 + i * 48} 44 L${25 + i * 52} 100" class="thread"/><path d="M${51 + i * 48} 44 L${51 + i * 52} 100" class="thread"/></g>`).join("") +
      t(120, 140, "patches in, word pieces out", 'class="cap soft" text-anchor="middle"'), "A text decoder writes word pieces while looking back at image patches");
  },
  svtr: () => {
    const xs = range(10).map((i) => 20 + i * 22);
    return svg(xs.map((x) => r(x - 9, 90, 18, 18, 'class="lay"')).join("") +
      xs.slice(0, 9).map((x) => `<path d="M${x} 90 Q${x + 11} 76 ${x + 22} 90" class="thread a-flick"/>`).join("") +
      `<path d="M20 90 Q120 30 218 90" class="thread a-flick" style="--d:.4s"/><path d="M42 90 Q130 46 196 90" class="thread a-flick" style="--d:.8s"/>` +
      `<g class="a-fade" style="--d:1s">${t(120, 40, "S V T R", 'class="big" text-anchor="middle"')}</g>` + t(120, 130, "local + global mixing, CTC in one shot", 'class="cap" text-anchor="middle"'), "Patches mixed locally and globally, then decoded in one shot");
  },
  latex: () => {
    const tok = ["x", "^", "{", "2", "}", "+", "\\sqrt", "{", "y", "}"];
    return svg(r(14, 30, 72, 50, 'class="px"') + t(50, 64, "x² + √y", 'class="hand" text-anchor="middle"') + arrow(92, 55, 112, 55) +
      tok.map((s, i) => `<g class="a-fade" ${d(i, 0.18)}>${t(122 + (i % 5) * 22, 50 + Math.floor(i / 5) * 22, s, 'class="mono small"')}</g>`).join("") +
      t(120, 130, "one LaTeX token at a time, attending anywhere", 'class="cap soft" text-anchor="middle"'), "A formula image becomes LaTeX tokens");
  },
  table: () => {
    const cells = range(9).map((i) => r(14 + (i % 3) * 24, 40 + Math.floor(i / 3) * 18, 23, 17, 'class="lay"')).join("");
    const node = (x, y, s, i) => `<g class="a-fade" ${d(i, 0.2)}>${r(x - 18, y - 9, 36, 16, 'class="fm"')}${t(x, y + 3, s, 'class="mono small" text-anchor="middle"')}</g>`;
    return svg(cells + arrow(94, 66, 112, 66) + node(170, 30, "table", 0) + node(140, 64, "tr", 1) + node(200, 64, "tr", 2) + node(126, 98, "td", 3) + node(156, 98, "td", 4) + node(200, 98, "td", 5) +
      `<path d="M170 38 L140 56 M170 38 L200 56 M140 72 L126 90 M140 72 L156 90 M200 72 L200 90" class="ln a-draw"/>` + t(120, 136, "compared as trees: TEDS", 'class="cap soft" text-anchor="middle"'), "A table becomes an HTML tree");
  },
  cells: () => svg(range(12).map((i) => r(30 + (i % 4) * 46, 28 + Math.floor(i / 4) * 28, 42, 24, 'class="lay"')).join("") +
    range(12).map((i) => r(34 + (i % 4) * 46, 32 + Math.floor(i / 4) * 28, 34, 16, `class="box a-fade" ${d(i, 0.12)}`)).join("") +
    t(120, 134, "structure tags plus a box per cell", 'class="cap soft" text-anchor="middle"'), "Every table cell gets its own box"),
  layout: () => {
    const words = [[20, 30, 60, "INVOICE"], [150, 30, 70, "No 1042"], [20, 70, 50, "Item"], [150, 70, 40, "9.50"], [110, 108, 50, "Total"], [170, 108, 50, "19.00"]];
    return svg(r(12, 18, 216, 112, 'class="px"') + words.map(([x, y, w, s], i) => `<g class="a-fade" ${d(i, 0.2)}>${r(x, y, w, 16, 'class="box"')}${t(x + 4, y + 12, s, 'class="mono small"')}${t(x + w, y - 3, `(${x},${y})`, 'class="cap tiny hot2" text-anchor="end"')}</g>`).join("") +
      t(120, 146, "'Total' bottom right means something", 'class="cap soft" text-anchor="middle"'), "Words with their coordinates on a page");
  },
  json: () => svg(r(12, 22, 64, 86, 'class="px"') + range(6).map((i) => r(20, 32 + i * 12, 30 + (i * 13) % 30, 5, 'class="ink"')).join("") + arrow(84, 64, 104, 64) +
    ['{', '  "number": "1042",', '  "date": "2026-11-20",', '  "total": 19.00', '}'].map((s, i) => `<g class="a-fade" ${d(i, 0.3)}>${t(112, 40 + i * 16, s.replace(/ /g, "&#160;"), 'class="mono small"')}</g>`).join("") +
    t(120, 136, "no OCR engine in between", 'class="cap soft" text-anchor="middle"'), "A page image written directly as JSON"),
  markdown: () => svg(r(12, 22, 64, 86, 'class="px"') + range(6).map((i) => r(20, 32 + i * 12, 30 + (i * 17) % 30, 5, 'class="ink"')).join("") + arrow(84, 64, 104, 64) +
    ["# Results", "- accuracy rose", "- cost fell", "$$E = mc^2$$"].map((s, i) => `<g class="a-fade" ${d(i, 0.35)}>${t(112, 42 + i * 18, s, 'class="mono small"')}</g>`).join("") +
    t(120, 136, "headings, lists and equations from pixels", 'class="cap soft" text-anchor="middle"'), "A scientific page written as Markdown and LaTeX"),
  got: () => {
    const it = [["Aa", 26], ["∑x", 62], ["♪", 98], ["▦", 134], ["⌬", 170], ["▁▃▆", 206]];
    return svg(it.map(([s, x], i) => `<g class="a-fade" ${d(i, 0.15)}>${r(x - 15, 22, 30, 26, 'class="lay"')}${t(x, 40, s, 'class="mono small" text-anchor="middle"')}<path d="M${x} 48 L120 94" class="thread a-flick" ${d(i, 0.2)}/></g>`).join("") +
      r(84, 94, 72, 26, 'class="fm"') + t(120, 111, "one 580M model", 'class="mono small" text-anchor="middle"') + t(120, 142, "text, maths, music, tables, molecules, charts", 'class="cap soft" text-anchor="middle"'), "Many kinds of characters into one model");
  },
  olm: () => svg(r(14, 20, 90, 110, 'class="px"') + range(6).map((i) => `<path d="M22 ${36 + i * 14} H${84 - (i % 3) * 10}" class="dash"/>`).join("") +
    t(59, 124, "PDF text anchor", 'class="cap tiny" text-anchor="middle"') +
    ["table cell right", "order kept", "no invented text", "maths renders"].map((s, i) => `<g class="a-fade" ${d(i, 0.4)}>${t(122, 42 + i * 22, "✓", 'class="tick"')}${t(138, 42 + i * 22, s, 'class="cap"')}</g>`).join("") +
    t(170, 140, "reward = unit tests passed", 'class="cap soft" text-anchor="middle"'), "A PDF text anchor and a list of passing unit tests"),
  compress: () => {
    const small = range(40).map((i) => r(14 + (i % 10) * 9, 40 + Math.floor(i / 10) * 9, 7, 7, `class="lay a-shrink" style="--d:${(i * 0.02).toFixed(2)}s"`)).join("");
    return svg(small + t(58, 92, "40 text tokens", 'class="cap" text-anchor="middle"') + arrow(112, 56, 136, 56) +
      range(4).map((i) => r(146 + (i % 2) * 34, 30 + Math.floor(i / 2) * 34, 30, 30, `class="fm a-fade" style="--d:${0.9 + i * 0.1}s"`)).join("") +
      t(178, 110, "4 vision tokens", 'class="cap" text-anchor="middle"') + t(120, 140, "about 97% recovered under 10x", 'class="cap soft" text-anchor="middle"'), "Many text tokens compressed into a few vision tokens");
  },
  ppocr: () => svg([["detect", "DB"], ["classify", "angle"], ["recognise", "CRNN"]].map(([a, b], i) => `<g class="a-fade" ${d(i, 0.3)}>` + r(10 + i * 78, 44, 64, 42, 'class="lay"') +
    t(42 + i * 78, 62, a, 'class="mono small" text-anchor="middle"') + t(42 + i * 78, 78, b, 'class="cap" text-anchor="middle"') + `</g>`).join("") +
    arrow(76, 65, 86, 65) + arrow(154, 65, 164, 65) + t(120, 116, "distil, prune, quantise, shrink", 'class="cap" text-anchor="middle"') +
    t(120, 136, "3.5M parameters in total", 'class="cap soft" text-anchor="middle"'), "Three small stages make up the PP-OCR system"),
  heads: () => svg(r(16, 52, 70, 40, 'class="lay"') + t(51, 76, "backbone", 'class="mono small" text-anchor="middle"') +
    `<path d="M86 66 C110 66 110 40 136 40" class="ln"/><path d="M86 78 C110 78 110 104 136 104" class="ln a-ghost"/>` +
    r(136, 26, 84, 28, 'class="fm"') + t(178, 44, "CTC: ships", 'class="mono small" text-anchor="middle"') +
    `<g class="a-ghost">${r(136, 90, 84, 28, 'class="lay dashed"')}${t(178, 108, "attention: training only", 'class="cap" text-anchor="middle"')}</g>` +
    t(120, 142, "two heads teach, one fast head runs", 'class="cap soft" text-anchor="middle"'), "A backbone with a CTC head that ships and an attention head used only in training"),
  layoutvl: () => {
    const regs = [[18, 18, 92, 14, "title"], [18, 38, 44, 50, "text"], [66, 38, 44, 26, "table"], [66, 68, 44, 20, "formula"]];
    return svg(r(12, 12, 104, 84, 'class="px"') + regs.map(([x, y, w, h], i) => `<g class="a-fade" ${d(i, 0.2)}>${r(x, y, w, h, 'class="box"')}${t(x + 4, y + 11, i + 1, 'class="mono small hot2"')}</g>`).join("") +
      regs.map(([, , , , s], i) => `<g class="a-slidein" ${d(i, 0.25)}>${r(146, 14 + i * 22, 74, 18, 'class="fm"')}${t(183, 27 + i * 22, s, 'class="mono small" text-anchor="middle"')}</g>`).join("") +
      arrow(120, 54, 140, 54) + t(64, 118, "layout + reading order", 'class="cap" text-anchor="middle"') + t(183, 118, "0.9B VLM per crop", 'class="cap" text-anchor="middle"') +
      t(120, 142, "the VLM never sees a whole page", 'class="cap soft" text-anchor="middle"'), "Layout regions numbered in reading order, each crop sent to a small VLM");
  },
  teachers: () => {
    const xs = range(5).map((i) => 28 + i * 46), nm = ["parse", "OCR", "fields", "figures", "tables"];
    return svg(xs.map((x, i) => `<circle cx="${x}" cy="34" r="15" class="lay"/>${t(x, 38, nm[i], 'class="cap tiny" text-anchor="middle"')}` +
      `<path d="M${x} 49 L120 96" class="thread"/><circle r="3" class="dot a-flow" style="--x0:${x}px;--y0:49px;--x1:120px;--y1:96px;--d:${(i * 0.3).toFixed(1)}s"/>`).join("") +
      `<circle cx="120" cy="106" r="11" class="node a-pulse"/>` + t(120, 136, "five 4B teachers, one 0.8B student", 'class="cap" text-anchor="middle"'), "Five teacher models distilled into one small student");
  },
  pyramid: () => {
    const rows = [[1, "patch"], [2, "patch"], [3, "vendor"], [4, "layout"], [5, "base"]];
    const col = { patch: "#fc8181", vendor: "#f6ad55", layout: "#ecc94b", base: "#4fd1c5" };
    return svg(rows.map(([n, k], ri) => range(n).map((i) => r(120 - n * 20 + i * 40 + 2, 16 + ri * 22, 36, 18, `rx="3" fill="${col[k]}" fill-opacity=".28" stroke="${col[k]}" class="${ri === 4 ? "a-shake" : ""}"`)).join("")).join("") +
      `<path d="M70 104 l8 8 l-5 6 l9 8 M150 104 l-6 9 l7 5 l-4 10" class="crack a-draw" style="--d:.6s"/>` + t(120, 146, "new layouts crack the base", 'class="cap soft" text-anchor="middle"'), "A pyramid of rules cracking at its base");
  },
  passes: () => {
    const p = ["classify", "parties", "extract", "check", "correct"];
    return svg(p.map((s, i) => `<g class="a-light" ${d(i, 0.35)}>${r(6 + i * 47, 50, 42, 36, `rx="8" class="${i === 3 ? "lay" : "fm"}"`)}${t(27 + i * 47, 72, s, 'class="cap tiny" text-anchor="middle"')}</g>`).join("") +
      range(4).map((i) => `<path d="M${48 + i * 47} 68 h5" class="ln"/>`).join("") + t(167, 106, "plain code", 'class="cap tiny hot2" text-anchor="middle"') +
      t(120, 32, "Qwen3-VL-8B, five small steps", 'class="cap" text-anchor="middle"') + t(120, 134, "193 / 198 on unseen documents", 'class="cap soft" text-anchor="middle"'), "Five passes of a document pipeline");
  },
  twin: () => {
    const cells = (ox, c) => range(30).map((i) => `<rect x="${ox + (i % 6) * 15}" y="${26 + Math.floor(i / 6) * 15}" width="13" height="13" fill="${c}" class="a-flick" style="--d:${((i * 7) % 11) * 0.15}s;--o:${0.15 + ((i * 37) % 10) / 12}"/>`).join("");
    return svg(cells(14, "#7f9cf5") + cells(136, "#f6ad55") + t(58, 118, "dense Qwen", 'class="cap" text-anchor="middle"') + t(180, 118, "Gemma MoE", 'class="cap" text-anchor="middle"') +
      t(120, 140, "same document, two ways of reading", 'class="cap soft" text-anchor="middle"'), "Two attention heatmaps side by side");
  },
  looks: () => {
    const spots = [[40, 34], [150, 34], [70, 70], [180, 96]];
    return svg(r(14, 18, 212, 92, 'class="px"') + range(5).map((i) => r(26, 30 + i * 16, 80 + (i * 29) % 100, 6, 'class="ink"')).join("") +
      spots.map(([x, y], i) => `<g class="a-cycle" style="--d:${i * 0.8}s"><circle cx="${x}" cy="${y}" r="9" class="ring"/><path d="M${x} ${y + 9} L120 124" class="thread"/></g>`).join("") +
      r(96, 122, 48, 18, 'class="fm"') + t(120, 135, "token", 'class="mono small" text-anchor="middle"'), "A generated token pointing at where it looks on the page");
  },
  weights: () => svg(range(84).map((i) => r(16 + (i % 14) * 15, 22 + Math.floor(i / 14) * 15, 12, 12, `class="${[17, 44, 71].includes(i) ? "fm a-pulse" : "px"}"`)).join("") +
    t(120, 128, "3 edits, 0.013% of weights", 'class="cap" text-anchor="middle"') + t(120, 144, "no training run", 'class="cap soft" text-anchor="middle"'), "A grid of weights with three edited cells"),
};

const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--soft)"/></marker></defs></svg>`;

function illo(key) { return I[key] ? I[key]() : ""; }
if (typeof module !== "undefined") module.exports = { illo, DEFS, keys: Object.keys(I) };
