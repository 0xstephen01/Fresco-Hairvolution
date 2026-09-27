import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"] });
for (const [w,h,name] of [[1280,900,"about-desktop"],[390,844,"about-mobile"]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('http://localhost:5173/#/', { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  const el = await p.$('#about');
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(600);
  await el.screenshot({ path: `${name}.png` });
  await p.close();
}
await b.close();
