import { chromium } from "playwright-core";

const url = "http://localhost:5173";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

for (const vp of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(2500);

  const out = await page.evaluate(() => {
    const res = {};
    res.docScrollW = document.documentElement.scrollWidth;
    res.innerW = window.innerWidth;

    // overflow offenders
    res.overflow = [];
    document.querySelectorAll("*").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0) return;
      if (r.right > window.innerWidth + 1 || r.left < -1) {
        res.overflow.push({
          tag: el.tagName,
          cls: (el.className || "").toString().slice(0, 70),
          left: Math.round(r.left),
          right: Math.round(r.right),
          text: (el.textContent || "").trim().slice(0, 40),
        });
      }
    });

    const hero = document.querySelector("#top");
    if (hero) {
      const hr = hero.getBoundingClientRect();
      res.hero = { top: Math.round(hr.top), h: Math.round(hr.height), w: Math.round(hr.width) };
      const h1 = hero.querySelector("h1");
      const p = hero.querySelector("p");
      const btn = hero.querySelector("button");
      const img = hero.querySelector("img");
      const box = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          left: Math.round(r.left),
          right: Math.round(r.right),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          fs: getComputedStyle(el).fontSize,
        };
      };
      res.h1 = box(h1);
      res.p = box(p);
      res.btn = box(btn);
      if (img) {
        const r = img.getBoundingClientRect();
        res.heroImg = {
          left: Math.round(r.left),
          right: Math.round(r.right),
          w: Math.round(r.width),
          h: Math.round(r.height),
          natural: img.naturalWidth + "x" + img.naturalHeight,
          fit: getComputedStyle(img).objectFit,
          pos: getComputedStyle(img).objectPosition,
        };
      }
    }

    // section heights
    res.sections = [];
    document.querySelectorAll("section[id]").forEach((s) => {
      const r = s.getBoundingClientRect();
      res.sections.push({ id: s.id, h: Math.round(r.height) });
    });

    // images without aspect ratio
    res.imgs = [];
    document.querySelectorAll("img").forEach((img) => {
      const r = img.getBoundingClientRect();
      if (r.width === 0) return;
      const cs = getComputedStyle(img);
      res.imgs.push({
        src: img.getAttribute("src"),
        w: Math.round(r.width),
        h: Math.round(r.height),
        ratio: +(r.width / r.height).toFixed(2),
        natural: img.naturalWidth + "x" + img.naturalHeight,
        fit: cs.objectFit,
        loaded: img.complete && img.naturalWidth > 0,
      });
    });

    // h2 overflow check
    res.h2s = [];
    document.querySelectorAll("h2").forEach((h) => {
      const r = h.getBoundingClientRect();
      res.h2s.push({
        text: (h.textContent || "").trim().slice(0, 40),
        left: Math.round(r.left),
        right: Math.round(r.right),
        fs: getComputedStyle(h).fontSize,
        scrollW: h.scrollWidth,
        clientW: h.clientWidth,
      });
    });

    return res;
  });

  console.log("=====", vp.name, vp.width + "x" + vp.height);
  console.log(JSON.stringify(out, null, 1));
  await ctx.close();
}
await browser.close();
