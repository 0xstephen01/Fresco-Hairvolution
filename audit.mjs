import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"] });
for (const [w,h] of [[390,844],[1280,900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('http://localhost:5173/#/', { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const out = {};
    out.overflow = document.documentElement.scrollWidth - window.innerWidth;
    const hero = document.querySelector('#top');
    const hb = hero.getBoundingClientRect();
    out.heroH = Math.round(hb.height);
    const h1 = hero.querySelector('h1');
    const h1b = h1.getBoundingClientRect();
    out.h1 = { size: getComputedStyle(h1).fontSize, top: Math.round(h1b.top), h: Math.round(h1b.height), right: Math.round(h1b.right) };
    const btn = hero.querySelector('button');
    const bb = btn.getBoundingClientRect();
    out.btn = { w: Math.round(bb.width), h: Math.round(bb.height), bottom: Math.round(bb.bottom) };
    out.gapAbove = Math.round(h1b.top - hb.top);
    out.gapBelow = Math.round(hb.bottom - bb.bottom);
    out.heads = [...document.querySelectorAll('h2')].slice(0,6).map(x => ({ t: x.textContent.slice(0,28), size: getComputedStyle(x).fontSize, right: Math.round(x.getBoundingClientRect().right) }));
    const about = document.querySelector('#about');
    if (about) {
      out.facts = [...about.querySelectorAll('dd')].map(d => Math.round(d.getBoundingClientRect().height));
      const img = about.querySelector('img').getBoundingClientRect();
      out.aboutImg = { w: Math.round(img.width), h: Math.round(img.height) };
    }
    return out;
  });
  console.log(w, JSON.stringify(r, null, 1));
  await p.close();
}
await b.close();
