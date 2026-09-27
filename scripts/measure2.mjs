import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", args:["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"] });
for (const vp of [{w:1280,h:800,n:"desktop"},{w:390,h:844,n:"mobile"}]) {
  const ctx = await browser.newContext({ viewport:{width:vp.w,height:vp.h} });
  const page = await ctx.newPage();
  await page.goto("http://localhost:5173", { waitUntil:"load", timeout:30000 });
  await page.waitForTimeout(2000);
  const r = await page.evaluate(() => {
    const out = { sections: [], overflow: [], images: [], placeholders: [] };
    document.querySelectorAll("section, footer, header").forEach(s => {
      const b = s.getBoundingClientRect();
      out.sections.push({ id: s.id || s.tagName.toLowerCase(), top: Math.round(b.top+scrollY), h: Math.round(b.height) });
    });
    document.querySelectorAll("*").forEach(el => {
      const b = el.getBoundingClientRect();
      if (b.width > 0 && (b.right > innerWidth + 1 || b.left < -1)) {
        const cs = getComputedStyle(el);
        if (cs.position !== "fixed" && cs.overflow !== "hidden") {
          out.overflow.push({ tag: el.tagName, cls: (el.className||"").toString().slice(0,60), left: Math.round(b.left), right: Math.round(b.right) });
        }
      }
    });
    document.querySelectorAll("img").forEach(im => {
      const b = im.getBoundingClientRect();
      out.images.push({ src: im.getAttribute("src"), nat: im.naturalWidth+"x"+im.naturalHeight, box: Math.round(b.width)+"x"+Math.round(b.height), cls: (im.className||"").toString().slice(0,70) });
    });
    const txt = document.body.innerText;
    ["lorem","placeholder","coming soon","todo","your text","tbd","xxx"].forEach(w => { if (txt.toLowerCase().includes(w)) out.placeholders.push(w); });
    return out;
  });
  console.log("=== " + vp.n);
  console.log("sections:", JSON.stringify(r.sections));
  console.log("overflow:", JSON.stringify(r.overflow.slice(0,8)));
  console.log("images:", JSON.stringify(r.images.slice(0,14), null, 0));
  console.log("placeholders:", JSON.stringify(r.placeholders));
  await ctx.close();
}
await browser.close();
