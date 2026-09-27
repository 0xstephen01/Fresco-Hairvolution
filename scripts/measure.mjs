import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", args:["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"] });
for (const vp of [{w:1280,h:800,n:"desktop"},{w:390,h:844,n:"mobile"}]) {
  const ctx = await browser.newContext({ viewport:{width:vp.w,height:vp.h} });
  const page = await ctx.newPage();
  await page.goto("http://localhost:5173", { waitUntil:"load", timeout:30000 });
  await page.waitForTimeout(2500);
  const r = await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const box = (el) => { if(!el) return null; const b = el.getBoundingClientRect(); return {top:Math.round(b.top),bottom:Math.round(b.bottom),left:Math.round(b.left),right:Math.round(b.right),w:Math.round(b.width),h:Math.round(b.height)}; };
    const hero = q("#top");
    const h1 = q("h1");
    const img = hero ? hero.querySelector("img") : null;
    const btns = hero ? [...hero.querySelectorAll("button, a")].map(b=>({t:(b.textContent||"").trim().slice(0,28), ...box(b)})) : [];
    return {
      docH: document.documentElement.scrollHeight,
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      hero: box(hero),
      h1: box(h1),
      img: box(img),
      imgNatural: img ? {w:img.naturalWidth,h:img.naturalHeight} : null,
      btns,
    };
  });
  console.log("=== " + vp.n + " " + vp.w + "x" + vp.h);
  console.log(JSON.stringify(r, null, 1));
  await ctx.close();
}
await browser.close();
