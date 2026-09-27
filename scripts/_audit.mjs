import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", args:["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"] });
for (const vp of [{w:1280,h:800,n:"desktop"},{w:768,h:1024,n:"tablet"},{w:390,h:844,n:"mobile"}]) {
  const ctx = await browser.newContext({ viewport:{width:vp.w,height:vp.h} });
  const page = await ctx.newPage();
  await page.goto("http://localhost:5173", { waitUntil:"load", timeout:30000 });
  await page.waitForTimeout(2200);
  const r = await page.evaluate(() => {
    const sec = document.querySelector("section#top");
    const img = document.querySelector("section#top img");
    const s = sec?.getBoundingClientRect();
    const i = img?.getBoundingClientRect();
    const nav = [...document.querySelectorAll("header a, header button")].map(a=>{
      const b=a.getBoundingClientRect();
      return {t:(a.textContent||"").trim().slice(0,14), x:Math.round(b.left), y:Math.round(b.top), w:Math.round(b.width)};
    });
    const facts = [...document.querySelectorAll("#about dd, #about dt")].slice(0,8).map(e=>{
      const b=e.getBoundingClientRect(); return {t:(e.textContent||"").trim().slice(0,30), w:Math.round(b.width), h:Math.round(b.height)};
    });
    return {
      hero:{h:Math.round(s?.height||0), w:Math.round(s?.width||0)},
      img:i?{l:Math.round(i.left),t:Math.round(i.top),w:Math.round(i.width),h:Math.round(i.height),nw:img.naturalWidth,nh:img.naturalHeight,fit:getComputedStyle(img).objectFit,pos:getComputedStyle(img).objectPosition}:null,
      nav, facts,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  if (r.img) {
    const scale = Math.max(r.img.w/r.img.nw, r.img.h/r.img.nh);
    r.visibleH = Math.round(Math.min(1, r.img.h/(r.img.nh*scale))*100);
    r.visibleW = Math.round(Math.min(1, r.img.w/(r.img.nw*scale))*100);
  }
  console.log("==="+vp.n, JSON.stringify(r));
  await ctx.close();
}
await browser.close();