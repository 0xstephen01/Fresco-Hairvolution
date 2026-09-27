// Measure the landing page at true viewport sizes (the screenshot helper
// stretches the viewport to full page height, which distorts the hero).
//   node scripts/audit-hero.mjs
import { chromium } from "playwright-core";

const url = "http://localhost:5173/";
const executablePath = process.env.CHROMIUM_PATH || "/usr/bin/chromium";
const browser = await chromium.launch({
  executablePath,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

const sizes = [
  { name: "desktop", width: 1280, height: 800, mobile: false },
  { name: "phone", width: 390, height: 844, mobile: true },
];

const out = {};
for (const s of sizes) {
  const ctx = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    deviceScaleFactor: 1,
    isMobile: s.mobile,
    hasTouch: s.mobile,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 200)));
  await page.goto(url, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(2500);

  const data = await page.evaluate(() => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return {
        x: Math.round(b.x),
        y: Math.round(b.y),
        w: Math.round(b.width),
        h: Math.round(b.height),
        bottom: Math.round(b.bottom),
      };
    };
    const hero = document.querySelector("#top");
    const h1 = hero?.querySelector("h1");
    const p = hero?.querySelector("p");
    const btn = hero?.querySelector("a, button");
    const img = hero?.querySelector("img");
    let imgInfo = null;
    if (img) {
      const b = img.getBoundingClientRect();
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const scale = Math.max(b.width / nw, b.height / nh);
      imgInfo = {
        rect: r(img),
        natural: `${nw}x${nh}`,
        visibleHeightPct: Math.round((b.height / (nh * scale)) * 100),
        visibleWidthPct: Math.round((b.width / (nw * scale)) * 100),
        objectPosition: getComputedStyle(img).objectPosition,
      };
    }
    const small = [];
    document.querySelectorAll("body *").forEach((el) => {
      if (!el.children.length && el.textContent.trim()) {
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < 12) {
          small.push({
            text: el.textContent.trim().slice(0, 44),
            fs: Math.round(fs * 10) / 10,
            tag: el.tagName,
          });
        }
      }
    });
    const imgs = [...document.querySelectorAll("img")].map((i) => {
      const b = i.getBoundingClientRect();
      return {
        src: (i.getAttribute("src") || "").slice(-34),
        w: Math.round(b.width),
        h: Math.round(b.height),
        natural: `${i.naturalWidth}x${i.naturalHeight}`,
        loaded: i.complete && i.naturalWidth > 0,
      };
    });
    const about = (() => {
      const sec = document.querySelector("#about");
      if (!sec) return null;
      const im = sec.querySelector("img");
      const facts = [...sec.querySelectorAll("p, span, div")].filter(
        (d) => d.children.length === 0 && /Years|Home visits|Barber/.test(d.textContent),
      );
      return {
        img: r(im),
        facts: facts.map((f) => ({
          t: f.textContent.trim().slice(0, 34),
          fs: getComputedStyle(f).fontSize,
        })),
      };
    })();
    return {
      hero: r(hero),
      h1: r(h1),
      p: r(p),
      btn: r(btn),
      img: imgInfo,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      small: small.slice(0, 40),
      imgs,
      about,
    };
  });
  out[s.name] = { ...data, errors };
  await ctx.close();
}
console.log(JSON.stringify(out, null, 2));
await browser.close();
