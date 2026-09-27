// Audit the hero at true viewport sizes (no full-page stretching).
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:5173";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

for (const vp of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
]) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(1800);

  const geo = await page.evaluate(() => {
    const sec = document.querySelector("section#top");
    const img = sec.querySelector("img");
    const h1 = sec.querySelector("h1");
    const p = sec.querySelector("p");
    const cta = sec.querySelector("button");
    const r = (el) => {
      const b = el.getBoundingClientRect();
      return {
        x: Math.round(b.x), y: Math.round(b.y),
        w: Math.round(b.width), h: Math.round(b.height),
        bottom: Math.round(b.bottom), right: Math.round(b.right),
      };
    };
    const ir = img.getBoundingClientRect();
    const scale = Math.max(ir.width / img.naturalWidth, ir.height / img.naturalHeight);
    return {
      hero: r(sec),
      img: {
        ...r(img),
        natural: [img.naturalWidth, img.naturalHeight],
        visiblePctW: Math.round((ir.width / (img.naturalWidth * scale)) * 100),
        visiblePctH: Math.round((ir.height / (img.naturalHeight * scale)) * 100),
      },
      h1: r(h1),
      p: r(p),
      cta: r(cta),
      ctaAboveFold: cta.getBoundingClientRect().bottom <= window.innerHeight,
      docOverflow: document.documentElement.scrollWidth - window.innerWidth,
      // any element wider than the viewport?
      wide: [...document.querySelectorAll("body *")]
        .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
        .slice(0, 6)
        .map((el) => `${el.tagName}.${(el.className || "").toString().slice(0, 40)}`),
    };
  });
  console.log(vp.name, JSON.stringify(geo, null, 1));

  await page.screenshot({ path: `/tmp/audit-${vp.name}.png` });

  // Text hidden, to sample the backdrop behind the copy.
  await page.evaluate(() => {
    document
      .querySelectorAll("section#top h1, section#top p, section#top button, section#top a")
      .forEach((el) => { el.style.visibility = "hidden"; });
  });
  await page.waitForTimeout(250);
  await page.screenshot({ path: `/tmp/audit-${vp.name}-backdrop.png` });
  await ctx.close();
}
await browser.close();
console.log("ok");
