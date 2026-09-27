import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/chromium' });
for (const vp of [{w:1280,h:900,n:'desktop'},{w:390,h:844,n:'phone'}]) {
  const p = await b.newPage({ viewport: { width: vp.w, height: vp.h } });
  await p.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => {
    const hero = document.querySelector('#top');
    const img = hero.querySelector('img');
    const h1 = hero.querySelector('h1');
    const cta = hero.querySelector('a[href], button');
    const hb = hero.getBoundingClientRect();
    const ib = img.getBoundingClientRect();
    const tb = h1.getBoundingClientRect();
    const cb = cta.getBoundingClientRect();
    return {
      heroH: Math.round(hb.height), heroW: Math.round(hb.width),
      img: { x: Math.round(ib.x), w: Math.round(ib.width), h: Math.round(ib.height) },
      h1: { top: Math.round(tb.top), bottom: Math.round(tb.bottom), left: Math.round(tb.left), right: Math.round(tb.right) },
      cta: { top: Math.round(cb.top), bottom: Math.round(cb.bottom), left: Math.round(cb.left) },
      docW: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  console.log(vp.n, JSON.stringify(r));
  await p.close();
}
await b.close();
