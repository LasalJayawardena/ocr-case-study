(() => {
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const road = $("#road"), river = $("#river"), bed = $("#riverBed"), flow = $("#riverFlow"), shine = $("#riverShine"), head = $("#riverHead"), grad = $("#riverGrad");
  const eras = $$(".era");

  /* ---------- the river: a smooth curve through every node, drawn as you scroll ---------- */
  let total = 0, table = [], nodes = [];
  function catmull(pts) {
    if (pts.length < 2) return "";
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
  }
  // each segment leaves and enters vertically: an S-bend between every pair of points
  function meander(pts) {
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1] = pts[i - 1], [x2, y2] = pts[i], k = (y2 - y1) * 0.55;
      d += ` C${x1.toFixed(1)} ${(y1 + k).toFixed(1)} ${x2.toFixed(1)} ${(y2 - k).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    }
    return d;
  }
  function build() {
    river.style.height = "0px";   // measure the road without the river's own height feeding back in
    const R = road.getBoundingClientRect(), W = R.width, H = road.offsetHeight, narrow = innerWidth <= 860;
    river.setAttribute("viewBox", `0 0 ${W} ${H}`); river.style.height = H + "px";
    const cx = narrow ? 23 : W / 2, pts = [[cx, 0]];
    nodes = [];
    for (const it of $$(".era > .item", road)) {
      const b = it.getBoundingClientRect(), y0 = b.top - R.top;
      const n = $(".node", it);
      if (n) {
        const nb = n.getBoundingClientRect(), p = [nb.left + nb.width / 2 - R.left, nb.top + nb.height / 2 - R.top];
        // a meander: ease into the node from above and out below, so the river swings wide between cards
        pts.push(p);
        nodes.push({ el: n, y: p[1] });
      } else pts.push([cx, y0 + b.height / 2]);
    }
    pts.push([cx, H - 10]);
    // drop near-duplicate points so the curve stays smooth
    const clean = pts.filter((p, i) => i === 0 || Math.abs(p[1] - pts[i - 1][1]) > 2 || Math.abs(p[0] - pts[i - 1][0]) > 2);
    const d = narrow ? catmull(clean) : meander(clean);
    for (const p of [bed, flow, shine]) p.setAttribute("d", d);
    total = flow.getTotalLength();
    flow.style.strokeDasharray = `${total} ${total}`;
    // length-by-y lookup so scroll position maps to how much river is drawn
    table = []; const N = 600;
    for (let i = 0; i <= N; i++) { const l = (total * i) / N, pt = flow.getPointAtLength(l); table.push([pt.y, l, pt.x]); }
    // era colours along the river
    grad.setAttribute("y2", H); grad.innerHTML = "";
    for (const e of eras) {
      const top = e.offsetTop, h = e.offsetHeight, c = e.dataset.color;
      for (const [off, y] of [[0, top + 60], [1, top + h - 60]]) { const s = document.createElementNS("http://www.w3.org/2000/svg", "stop"); s.setAttribute("offset", Math.max(0, Math.min(1, y / H))); s.setAttribute("stop-color", c); grad.appendChild(s); }
    }
    onScroll();
  }
  function lengthAt(y) {
    let lo = 0, hi = table.length - 1;
    if (!table.length) return [0, 0, 0];
    if (y <= table[0][0]) return [table[0][1], table[0][2], table[0][0]];
    // the path is not strictly monotonic in y (meanders), so take the first sample past y
    for (let i = 0; i < table.length; i++) if (table[i][0] >= y) { hi = i; break; } else lo = i;
    const a = table[Math.max(0, hi - 1)], b = table[hi], f = b[0] === a[0] ? 1 : (y - a[0]) / (b[0] - a[0]);
    return [a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f, y];
  }
  let ticking = false;
  function onScroll() {
    ticking = false;
    const R = road.getBoundingClientRect(), y = innerHeight * 0.62 - R.top;
    const [l] = lengthAt(y), len = reduce ? total : Math.max(0, Math.min(total, l));
    flow.style.strokeDashoffset = total - len;
    const p = total ? flow.getPointAtLength(len) : { x: 0, y: 0 };
    head.setAttribute("cx", p.x); head.setAttribute("cy", p.y);
    head.style.opacity = len > 4 && len < total - 4 ? 1 : 0;
    for (const n of nodes) n.el.classList.toggle("reached", n.y <= y + 2);
    // minimap + head colour
    let cur = null;
    for (const e of eras) if (e.getBoundingClientRect().top < innerHeight * 0.5) cur = e;
    const fin = $("#finale"); if (fin && fin.getBoundingClientRect().top < innerHeight * 0.5) cur = fin;
    $$(".minimap a").forEach((a) => a.classList.toggle("active", cur && a.dataset.era === cur.id));
    if (cur && cur.dataset.color) head.style.fill = cur.dataset.color;
    $(".minimap").classList.toggle("on", R.top < innerHeight * 0.4 && (!fin || fin.getBoundingClientRect().bottom > innerHeight * 0.3));
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  let rt; const rebuild = () => { clearTimeout(rt); rt = setTimeout(build, 120); };
  addEventListener("resize", rebuild);
  if ("ResizeObserver" in window) new ResizeObserver(rebuild).observe(road);
  document.fonts && document.fonts.ready.then(build);
  addEventListener("load", build);
  build();

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
  $$(".item, .fin-block").forEach((el) => (reduce ? el.classList.add("in") : io.observe(el)));

  /* ---------- jargon tooltips: hover, focus, tap ---------- */
  const tip = $("#tip"), G = window.GLOSSARY || {}, C = window.CATS || {};
  let openEl = null, hideT;
  function show(el) {
    const g = G[el.dataset.k]; if (!g) return;
    clearTimeout(hideT);
    if (openEl && openEl !== el) openEl.classList.remove("open");
    openEl = el; el.classList.add("open");
    $(".tip-h use", tip).setAttribute("href", "#i-" + g[2]);
    $(".tip-cat", tip).textContent = C[g[2]] || "";
    $(".tip-t", tip).textContent = g[0];
    $(".tip-d", tip).textContent = g[1];
    const go = $(".tip-go", tip), target = g[3] && document.getElementById(g[3]);
    const inside = target && target.contains(el);
    go.hidden = !target || inside;
    if (target) go.href = "#" + g[3];
    tip.hidden = false;
    const b = el.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
    let x = Math.min(Math.max(12, b.left + b.width / 2 - tw / 2), innerWidth - tw - 12), y = b.bottom + 10;
    if (y + th > innerHeight - 12) y = b.top - th - 10;
    tip.style.left = x + "px"; tip.style.top = Math.max(60, y) + "px";
    requestAnimationFrame(() => tip.classList.add("show"));
  }
  function hide(now) {
    clearTimeout(hideT);
    hideT = setTimeout(() => { tip.classList.remove("show"); openEl && openEl.classList.remove("open"); openEl = null; setTimeout(() => { if (!openEl) tip.hidden = true; }, 160); }, now ? 0 : 140);
  }
  document.addEventListener("mouseover", (e) => { const j = e.target.closest(".j"); if (j) show(j); else if (e.target.closest("#tip")) clearTimeout(hideT); });
  document.addEventListener("mouseout", (e) => { if (e.target.closest(".j") || e.target.closest("#tip")) hide(); });
  document.addEventListener("focusin", (e) => { const j = e.target.closest(".j"); if (j) show(j); });
  document.addEventListener("focusout", (e) => { if (e.target.closest(".j") && !tip.contains(e.relatedTarget)) hide(); });
  document.addEventListener("click", (e) => {
    const j = e.target.closest(".j");
    if (j) { e.preventDefault(); openEl === j && tip.classList.contains("show") ? hide(true) : show(j); return; }
    if (e.target.closest(".tip-go")) { hide(true); return; }
    if (!e.target.closest("#tip")) hide(true);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hide(true);
    const j = e.target.closest && e.target.closest(".j");
    if (j && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); show(j); }
  });
  addEventListener("scroll", () => { if (openEl && !tip.matches(":hover")) hide(true); }, { passive: true });

  /* ---------- the arc table lights its stops on the river ---------- */
  $$(".arc-row").forEach((row) => {
    const ids = row.dataset.stops.split(","), ns = () => ids.map((id) => document.getElementById(id)).filter(Boolean).map((s) => $(".node", s)).filter(Boolean);
    const on = () => ns().forEach((n) => n.classList.add("glow")), off = () => ns().forEach((n) => n.classList.remove("glow"));
    row.addEventListener("mouseenter", on); row.addEventListener("mouseleave", off);
    row.addEventListener("focus", on); row.addEventListener("blur", off);
    const go = () => { const t = document.getElementById(ids[0]); if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); };
    row.addEventListener("click", go);
    row.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
  });

  /* ---------- hero: a field of glyphs that keeps resolving into words ---------- */
  const cv = $("#glyphs");
  if (cv && cv.getContext) {
    const ctx = cv.getContext("2d"), CH = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&?§¶∑∫√", WORDS = ["READ", "MNIST", "CTC", "CRNN", "ATTENTION", "JSON", "LAYOUT", "TOKEN"];
    let cells = [], cols = 0, rows = 0, size = 22, wi = 0, last = 0;
    const fit = () => {
      const dpr = Math.min(2, devicePixelRatio || 1); cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size = innerWidth < 600 ? 16 : 22; cols = Math.ceil(cv.clientWidth / size); rows = Math.ceil(cv.clientHeight / size);
      cells = Array.from({ length: cols * rows }, () => ({ c: CH[(Math.random() * CH.length) | 0], a: Math.random() * 0.25, lock: 0 }));
    };
    const stamp = () => {
      const w = WORDS[wi++ % WORDS.length], r = (Math.random() * (rows - 4) + 2) | 0, c0 = Math.max(1, ((Math.random() * (cols - w.length - 2)) | 0));
      [...w].forEach((ch, i) => { const cell = cells[r * cols + c0 + i]; if (cell) { cell.c = ch; cell.lock = 90 + i * 4; } });
    };
    const frame = (t) => {
      if (t - last > 70) {
        last = t; ctx.clearRect(0, 0, cv.clientWidth, cv.clientHeight); ctx.font = `${size * 0.62}px "JetBrains Mono", monospace`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        if (Math.random() < 0.06) stamp();
        for (let i = 0; i < cells.length; i++) {
          const k = cells[i];
          if (k.lock > 0) { k.lock--; ctx.fillStyle = `rgba(227,178,92,${Math.min(1, k.lock / 40)})`; }
          else { if (Math.random() < 0.02) k.c = CH[(Math.random() * CH.length) | 0]; k.a += (Math.random() - 0.5) * 0.04; k.a = Math.max(0.02, Math.min(0.28, k.a)); ctx.fillStyle = `rgba(183,178,166,${k.a})`; }
          ctx.fillText(k.c, (i % cols) * size + size / 2, ((i / cols) | 0) * size + size / 2);
        }
      }
      if (!reduce && $(".hero").getBoundingClientRect().bottom > 0) requestAnimationFrame(frame); else if (!reduce) setTimeout(() => requestAnimationFrame(frame), 400);
    };
    fit(); addEventListener("resize", fit);
    for (let i = 0; i < 3; i++) stamp();
    requestAnimationFrame(frame);
  }
})();
