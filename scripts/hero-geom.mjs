import { chromium } from "playwright-core";

const executablePath = process.env.CHROMIUM_PATH || "/usr/bin/chromium";
const browser = await chromium.launch({
  executablePath,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

for (const vp of [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:5173/#/", { waitUntil: "load" });
  await page.waitForTimeout(2600);

  const data = await page.evaluate(() => {
    const out = { vw: innerWidth, vh: innerHeight, docScrollW: document.documentElement.scrollWidth };
    const hero = document.querySelector("section#top");
    const hb = hero.getBoundingClientRect();
    out.hero = { h: Math.round(hb.height), bottom: Math.round(hb.bottom) };
    const h1 = hero.querySelector("h1");
    const hb1 = h1.getBoundingClientRect();
    out.h1 = { y: Math.round(hb1.y), h: Math.round(hb1.height), right: Math.round(hb1.right) };
    const p = hero.querySelector("p");
    out.p = { y: Math.round(p.getBoundingClientRect().y), h: Math.round(p.getBoundingClientRect().height) };
    const btn = hero.querySelector("button");
    const bb = btn.getBoundingClientRect();
    out.btn = { y: Math.round(bb.y), bottom: Math.round(bb.bottom), w: Math.round(bb.width), h: Math.round(bb.height) };
    // photo geometry
    const img = hero.querySelector("img");
    const ib = img.getBoundingClientRect();
    out.img = { x: Math.round(ib.x), w: Math.round(ib.width), h: Math.round(ib.height), y: Math.round(ib.y) };
    out.imgNatural = { w: img.naturalWidth, h: img.naturalHeight };
    out.objectPosition = getComputedStyle(img).objectPosition;
    // how much of the photo's height is visible (cover math)
    const scale = Math.max(ib.width / img.naturalWidth, ib.height / img.naturalHeight);
    const drawnH = img.naturalHeight * scale;
    out.photoVisiblePct = Math.round((ib.height / drawnH) * 100);
    // sections
    out.sections = [...document.querySelectorAll("section")].map((s) => ({
      id: s.id || "(none)",
      h: Math.round(s.getBoundingClientRect().height),
    }));
    return out;
  });
  console.log(vp.name, JSON.stringify(data, null, 1));
  await page.screenshot({ path: `/tmp/hero-${vp.name}.png` });
  await ctx.close();
}
await browser.close();
