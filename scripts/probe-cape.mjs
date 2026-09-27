// Find where the cape logo sits in the hero photo, and measure the contrast
// behind the desktop headline's right end.
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";

const executablePath = process.env.CHROMIUM_PATH || "/usr/bin/chromium";
const browser = await chromium.launch({
  executablePath,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

// 1. Where is the bright cape logo in the source photo?
const b64 = readFileSync("public/uploads/hero.jpg").toString("base64");
const logo = await page.evaluate(async (data) => {
  const img = new Image();
  img.src = "data:image/jpeg;base64," + data;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const { data: px } = ctx.getImageData(0, 0, c.width, c.height);
  // Bright pixels in the lower 45% = the white logo on the dark cape.
  const rows = [];
  const y0 = Math.floor(c.height * 0.55);
  for (let y = y0; y < c.height; y += 8) {
    let bright = 0;
    for (let x = 0; x < c.width; x += 4) {
      const i = (y * c.width + x) * 4;
      const l = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
      if (l > 150) bright++;
    }
    rows.push({ y, pct: Math.round((y / c.height) * 100), bright });
  }
  const peak = rows.reduce((a, b) => (b.bright > a.bright ? b : a), rows[0]);
  return { size: `${c.width}x${c.height}`, peak, top: rows.slice(0, 6) };
}, b64);
console.log("cape logo in source photo:", JSON.stringify(logo));

// 2. Contrast behind the desktop headline's right end.
await page.goto("http://localhost:5173/", { waitUntil: "load" });
await page.waitForTimeout(3000);
const shot = await page.screenshot({ clip: { x: 0, y: 250, width: 1280, height: 180 } });
const b64shot = shot.toString("base64");
const contrast = await page.evaluate(async (data) => {
  const img = new Image();
  img.src = "data:image/png;base64," + data;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const { data: px } = ctx.getImageData(0, 0, c.width, c.height);
  const bands = [];
  for (let x = 560; x < 900; x += 20) {
    let max = 0;
    let sum = 0;
    let n = 0;
    for (let y = 0; y < c.height; y += 2) {
      const i = (y * c.width + x) * 4;
      const l = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
      max = Math.max(max, l);
      sum += l;
      n++;
    }
    bands.push({ x, max: Math.round(max), mean: Math.round(sum / n) });
  }
  return bands;
}, b64shot);
console.log("behind headline (x, max luma, mean luma):");
console.log(contrast.map((b) => `${b.x}:${b.max}/${b.mean}`).join("  "));
await browser.close();
