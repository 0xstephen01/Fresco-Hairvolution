import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", args:["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"] });
const out = {};
for (const vp of [{w:1280,h:800,n:"desktop"},{w:390,h:844,n:"mobile"}]) {
  const ctx = await browser.newContext({ viewport:{width:vp.w,height:vp.h} });
  const page = await ctx.newPage();
  await page.goto("http://localhost:5173", { waitUntil:"load", timeout:30000 });
  await page.waitForTimeout(2500);
  const r = await page.evaluate(() => {
    const box = (el) => { if(!el) return null; const b = el.getBoundingClientRect(); return {t:Math.round(b.top),b:Math.round(b.bottom),l:Math.round(b.left),r:Math.round(b.right),w:Math.round(b.width),h:Math.round(b.height)}; };
    const hero = document.querySelector("#top");
    const h1 = document.querySelector("h1");
    const header = document.querySelector("header");
    const links = [...document.querySelectorAll("header nav button")].map(b=>({t:(b.textContent||"").trim(), ...box(b)}));
    const imgs = hero ? [...hero.querySelectorAll("img")].map(i=>({vis:getComputedStyle(i).display!=="none", ...box(i), nat:{w:i.naturalWidth,h:i.naturalHeight}})) : [];
    return { hero: box(hero), h1: box(h1), header: box(header), links, imgs, scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth };
  });
  out[vp.n] = r;
  await page.screenshot({ path: `shot-${vp.n}.png` });
  await ctx.close();
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
