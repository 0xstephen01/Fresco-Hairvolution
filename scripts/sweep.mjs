// Sweep widths to find hero text/photo overlap and height problems.
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:5173";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

const widths = [
  { width: 390, height: 844 },
  { width: 640, height: 900 },
  { width: 768, height: 1024 },
  { width: 820, height: 1180 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1200 },
];

for (const vp of widths) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(1600);
  const g = await page.evaluate(() => {
    const sec = document.querySelector("section#top");
    const img = sec.querySelector("img");
    const h1 = sec.querySelector("h1");
    const p = sec.querySelector("p");
    const cta = sec.querySelector("button");
    const R = (el) => el.getBoundingClientRect();
    const secR = R(sec), imgR = R(img), h1R = R(h1), pR = R(p), ctaR = R(cta);
    const scale = Math.max(imgR.width / img.naturalWidth, imgR.height / img.naturalHeight);
    const drawnW = img.naturalWidth * scale;
    // Where the photo's opaque centre column actually sits (mask fades in
    // from the left, so treat the middle as the opaque reference).
    const opaqueLeft = imgR.left + (imgR.width - drawnW) / 2 + drawnW * 0.35;
    return {
      heroH: Math.round(secR.height),
      vh: window.innerHeight,
      heroPctVh: Math.round((secR.height / window.innerHeight) * 100),
      imgW: Math.round(imgR.width),
      imgPctW: Math.round((imgR.width / window.innerWidth) * 100),
      imgLeft: Math.round(imgR.left),
      imgOpaqueLeft: Math.round(opaqueLeft),
      h1Right: Math.round(h1R.right),
      h1Bottom: Math.round(h1R.bottom),
      pBottom: Math.round(pR.bottom),
      ctaBottom: Math.round(ctaR.bottom),
      ctaAboveFold: ctaR.bottom <= window.innerHeight,
      textOverPhoto: h1R.right > opaqueLeft,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      topGap: Math.round(h1R.top),
    };
  });
  console.log(`${vp.width}x${vp.height}`, JSON.stringify(g));
  await ctx.close();
}
await browser.close();