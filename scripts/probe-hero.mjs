import { chromium } from "playwright-core";

const ports = [5173, 5174, 5175, 3000, 8080];
let url = null;
for (const p of ports) {
  try {
    const r = await fetch(`http://localhost:${p}/`);
    if (r.ok) { url = `http://localhost:${p}/`; break; }
  } catch {}
}
if (!url) { console.log("no server found"); process.exit(1); }
console.log("server", url);

const browser = await chromium.launch();
for (const vp of [{ w: 1280, h: 800, name: "desktop" }, { w: 390, h: 844, name: "phone" }]) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const data = await page.evaluate(() => {
    const out = {};
    out.scrollWidth = document.documentElement.scrollWidth;
    out.innerWidth = window.innerWidth;
    const hero = document.querySelector("#top");
    const hr = hero.getBoundingClientRect();
    out.hero = { top: Math.round(hr.top), height: Math.round(hr.height) };
    const h1 = document.querySelector("h1");
    const h1r = h1.getBoundingClientRect();
    out.h1 = { top: Math.round(h1r.top), bottom: Math.round(h1r.bottom), height: Math.round(h1r.height) };
    const img = hero.querySelector("img");
    const ir = img.getBoundingClientRect();
    out.img = { x: Math.round(ir.x), w: Math.round(ir.width), h: Math.round(ir.height), natural: [img.naturalWidth, img.naturalHeight] };
    out.sections = [...document.querySelectorAll("section")].map((s) => {
      const r = s.getBoundingClientRect();
      return { id: s.id || "(none)", top: Math.round(r.top + window.scrollY), h: Math.round(r.height) };
    });
    const nav = document.querySelector("nav[aria-label='Main']");
    if (nav) out.navLinks = [...nav.querySelectorAll("button")].map((b) => ({ t: b.textContent, c: getComputedStyle(b).color }));
    const btn = [...document.querySelectorAll("button")].find((b) => /book now/i.test(b.textContent));
    if (btn) {
      const br = btn.getBoundingClientRect();
      out.cta = { top: Math.round(br.top), bottom: Math.round(br.bottom), visible: br.bottom <= window.innerHeight };
    }
    return out;
  });
  console.log(vp.name, JSON.stringify(data, null, 1));
  await page.close();
}
await browser.close();
