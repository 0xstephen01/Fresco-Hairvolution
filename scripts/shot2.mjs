import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
mkdirSync("/tmp/real", { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", args:["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"] });
for (const vp of [{w:1280,h:800,n:"desktop"},{w:390,h:844,n:"mobile"}]) {
  const ctx = await browser.newContext({ viewport:{width:vp.w,height:vp.h}, deviceScaleFactor:1 });
  const page = await ctx.newPage();
  await page.goto("http://localhost:5173", { waitUntil:"load", timeout:30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path:`/tmp/real/${vp.n}-hero.jpg`, type:"jpeg", quality:80 });
  await ctx.close();
}
await browser.close();
console.log("ok");
