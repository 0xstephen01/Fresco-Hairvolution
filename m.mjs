import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"] });
for (const [w,h] of [[390,844],[1280,900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('http://localhost:5173/#/', { waitUntil: 'load' });
  await p.waitForTimeout(1800);
  const r = await p.evaluate(() => {
    const out = {};
    const hero = document.querySelector('#top');
    const hb = hero.getBoundingClientRect();
    out.heroH = Math.round(hb.height);
    out.heroPct = Math.round(hb.height / window.innerHeight * 100);
    const img = hero.querySelector('img');
    const ib = img.getBoundingClientRect();
    out.img = { w: Math.round(ib.width), h: Math.round(ib.height), left: Math.round(ib.left) };
    out.natural = { w: img.naturalWidth, h: img.naturalHeight };
    const scale = Math.max(ib.width / img.naturalWidth, ib.height / img.naturalHeight);
    out.visiblePct = Math.round(ib.height / (img.naturalHeight * scale) * 100);
    const h1 = hero.querySelector('h1').getBoundingClientRect();
    out.h1 = { top: Math.round(h1.top), bottom: Math.round(h1.bottom), right: Math.round(h1.right) };
    const btn = hero.querySelector('button');
    const bb = btn.getBoundingClientRect();
    out.btn = { w: Math.round(bb.width), h: Math.round(bb.height), bottom: Math.round(bb.bottom) };
    out.docOverflow = document.documentElement.scrollWidth - window.innerWidth;
    const about = document.querySelector('#about');
    out.factLabelHeights = [...about.querySelectorAll('dd')].map(d => Math.round(d.getBoundingClientRect().height));
    const aimg = about.querySelector('img').getBoundingClientRect();
    out.aboutImg = { w: Math.round(aimg.width), h: Math.round(aimg.height) };
    return out;
  });
  console.log(w, JSON.stringify(r));
  await p.close();
}
await b.close();
