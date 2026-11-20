// Captures a preview of each live visualiser's landing view (JPEG, 1280x800 viewport, saved at 960x600).
// Every capture must be checked by eye before it is copied to public/shots/: no real documents in previews.
// Usage: node tools/shots.js <outDir> [key ...]
const path = require("path"), fs = require("fs");
const pw = require(path.join(__dirname, "..", "..", "SOTA_IDP", "node_modules", "playwright-core"));
const { SITES } = require("../web/content.js");
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const want = process.argv.slice(3);
(async () => {
  const exe = path.join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1208", "chrome-win64", "chrome.exe");
  const browser = await pw.chromium.launch({ executablePath: exe });
  for (const [k, s] of Object.entries(SITES)) {
    if (want.length && !want.includes(k)) continue;
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 0.75 });
    try {
      await page.goto(s.url, { waitUntil: "load", timeout: 60000 });
      await page.waitForTimeout(6000);
      await page.screenshot({ path: path.join(out, s.shot + ".jpg"), type: "jpeg", quality: 78 });
      console.log("ok", k);
    } catch (e) { console.log("fail", k, String(e).slice(0, 120)); }
    await page.close();
  }
  await browser.close();
})();
