import { chromium } from "playwright-core";

const b = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

for (const [w, h, name] of [[390, 844, "phone"], [1280, 800, "desktop"]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto("http://localhost:5173/#/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const rect = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: Math.round(b.x), y: Math.round(b.y + window.scrollY), w: Math.round(b.width), h: Math.round(b.height) };
    };
    const hero = q("#top");
    const about = q("#about");
    const dl = about.querySelector("dl");
    const dd = about.querySelector("dd");
    const ps = about.querySelectorAll("p");
    const h2s = [...document.querySelectorAll("h2")].map((el) => ({
      t: el.textContent.slice(0, 24),
      size: getComputedStyle(el).fontSize,
      y: Math.round(el.getBoundingClientRect().y + window.scrollY),
    }));
    return {
      hero: rect(hero),
      heroH1: rect(hero.querySelector("h1")),
      heroH1Size: getComputedStyle(hero.querySelector("h1")).fontSize,
      heroBtn: rect(hero.querySelector("button")),
      about: rect(about),
      aboutImg: rect(about.querySelector("img")),
      aboutTextCol: rect(about.querySelector("div > div")),
      ddSize: getComputedStyle(dd).fontSize,
      dlCols: getComputedStyle(dl).gridTemplateColumns,
      paraSize: getComputedStyle(ps[ps.length - 1]).fontSize,
      h2s,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      scrollW: document.documentElement.scrollWidth,
    };
  });
  console.log(name, JSON.stringify(r, null, 1));
  await p.close();
}
await b.close();
