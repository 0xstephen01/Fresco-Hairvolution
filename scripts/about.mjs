import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", args:["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"] });
for (const vp of [{w:1280,h:800,n:"desktop"},{w:390,h:844,n:"mobile"}]) {
  const ctx = await browser.newContext({ viewport:{width:vp.w,height:vp.h} });
  const page = await ctx.newPage();
  await page.goto("http://localhost:5173", { waitUntil:"load", timeout:30000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => document.querySelector("#about")?.scrollIntoView());
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => {
    const sec = document.querySelector("#about");
    const img = sec.querySelector("img");
    const b = img.getBoundingClientRect();
    const cs = getComputedStyle(img);
    return {
      box: {top:Math.round(b.top),left:Math.round(b.left),w:Math.round(b.width),h:Math.round(b.height)},
      natural: {w:img.naturalWidth,h:img.naturalHeight},
      fit: cs.objectFit, pos: cs.objectPosition,
    };
  });
  console.log(vp.n, JSON.stringify(r));
  await ctx.close();
}
await browser.close();
