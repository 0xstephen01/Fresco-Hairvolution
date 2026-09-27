import { chromium } from "playwright-core";
const url = "http://localhost:5173";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
for (const vp of [{ w: 1280, h: 800 }, { w: 390, h: 844 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => {
    const sec = document.querySelector("#top");
    const r = sec.getBoundingClientRect();
    const h1 = sec.querySelector("h1").getBoundingClientRect();
    const p = sec.querySelector("p").getBoundingClientRect();
    const btn = sec.querySelector("button").getBoundingClientRect();
    const img = [...sec.querySelectorAll("img")].filter(
      (i) => getComputedStyle(i).display !== "none",
    )[0];
    const b = img.getBoundingClientRect();
    const cs = getComputedStyle(img);
    const nat = { w: img.naturalWidth, h: img.naturalHeight };
    const scale = Math.max(b.width / nat.w, b.height / nat.h);
    const visH = b.height / scale;
    const posY = parseFloat(cs.objectPosition.split(" ")[1]) / 100;
    const top = (nat.h - visH) * posY;
    return {
      hero: { h: Math.round(r.height), w: Math.round(r.width) },
      h1: { x: Math.round(h1.x), right: Math.round(h1.right), top: Math.round(h1.top), h: Math.round(h1.height) },
      p: { right: Math.round(p.right), top: Math.round(p.top) },
      btn: { top: Math.round(btn.top), bottom: Math.round(btn.bottom) },
      img: { x: Math.round(b.x), w: Math.round(b.width), h: Math.round(b.height), pos: cs.objectPosition },
      srcRows: { from: Math.round(top), to: Math.round(top + visH), of: nat.h },
      docW: document.documentElement.scrollWidth,
      vh: window.innerHeight,
    };
  });
  console.log(vp.w + "x" + vp.h, JSON.stringify(info));
  await ctx.close();
}
await browser.close();
