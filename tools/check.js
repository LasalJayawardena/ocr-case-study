// Local browser check: serves public/, takes screenshots at desktop and phone widths, reports console errors and overflow.
// Usage: node tools/check.js <outDir> [url]
const path = require("path"), fs = require("fs"), http = require("http");
const pw = require(path.join(__dirname, "..", "..", "SOTA_IDP", "node_modules", "playwright-core"));
const out = process.argv[2] || "shots-check"; fs.mkdirSync(out, { recursive: true });
const pub = path.join(__dirname, "..", "public");
const types = { ".html": "text/html", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png" };
const srv = http.createServer((q, s) => { let f = path.join(pub, decodeURIComponent(q.url.split("?")[0])); if (f.endsWith(path.sep) || f === pub) f = path.join(pub, "index.html");
  fs.readFile(f, (e, b) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }); s.end(b); }); });
(async () => {
  await new Promise((r) => srv.listen(4799, r));
  const url = process.argv[3] || "http://localhost:4799/";
  const exe = path.join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1208", "chrome-win64", "chrome.exe");
  const browser = await pw.chromium.launch({ executablePath: fs.existsSync(exe) ? exe : undefined });
  for (const [name, vp] of [["desk", { width: 1440, height: 900 }], ["phone", { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
    const errs = []; page.on("console", (m) => m.type() === "error" && errs.push(m.text())); page.on("pageerror", (e) => errs.push(String(e)));
    await page.goto(url, { waitUntil: "networkidle" }); await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" }); await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}/${name}-0-hero.png` });
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    const ov = await page.evaluate(() => { window.scrollTo(innerWidth, 0); const x = scrollX; window.scrollTo(0, 0); return x; });
    const ids = ["e0", "ticker", "leaders", "neocognitron", "mnist", "e2", "crnn", "trocr", "e3", "e4", "ppocr6", "e5", "legacy", "finale", "lab"];
    let i = 1;
    for (const id of ids) {
      await page.evaluate((id) => { const el = document.getElementById(id); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 80); }, id);
      await page.waitForTimeout(1300);
      await page.screenshot({ path: `${out}/${name}-${String(i++).padStart(2, "0")}-${id}.png` });
    }
    // tooltip
    await page.evaluate(() => { const j = document.querySelector("#ctc .j"); j.scrollIntoView({ block: "center" }); });
    await page.waitForTimeout(600);
    const bb = await (await page.$("#ctc .j")).boundingBox();
    if (vp.width > 800) await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); else await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${name}-tip.png` });
    const tipShown = await page.evaluate(() => document.querySelector("#tip").classList.contains("show"));
    const riverLen = await page.evaluate(() => document.querySelector("#riverFlow").getTotalLength());
    console.log(name, { height: H, overflowX: ov, tipShown, riverLen: Math.round(riverLen), errors: errs });
    await page.close();
  }
  await browser.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
