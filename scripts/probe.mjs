import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

// 1. Desktop: sample the pixels behind the nav links.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:5173", { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(2500);
  // Hide the nav so we can read the backdrop underneath it.
  await page.evaluate(() => {
    document.querySelectorAll("header nav button").forEach((b) => (b.style.visibility = "hidden"));
  });
  await page.screenshot({ path: "/tmp/navbg.png", clip: { x: 560, y: 20, width: 520, height: 40 } });
  await ctx.close();
}

// 2. Phone: measure every section's height and look for overflow.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:5173", { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(2500);
  const out = await page.evaluate(() => {
    const secs = [...document.querySelectorAll("section, footer")].map((s) => {
      const b = s.getBoundingClientRect();
      return { id: s.id || s.tagName, h: Math.round(b.height), w: Math.round(b.width) };
    });
    const over = [...document.querySelectorAll("*")]
      .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
      .slice(0, 8)
      .map((el) => ({
        tag: el.tagName,
        cls: (el.className || "").toString().slice(0, 60),
        right: Math.round(el.getBoundingClientRect().right),
      }));
    const h2 = [...document.querySelectorAll("h2")].map((h) => ({
      text: h.textContent.slice(0, 40),
      w: Math.round(h.getBoundingClientRect().width),
      h: Math.round(h.getBoundingClientRect().height),
    }));
    return { secs, over, h2, docW: document.documentElement.scrollWidth };
  });
  console.log(JSON.stringify(out, null, 1));
  await ctx.close();
}
await browser.close();
