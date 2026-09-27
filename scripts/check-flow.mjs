import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

const out = {};

// 1. setup page: unreachable project gives a human message
await page.goto("http://localhost:5173/#/setup", { waitUntil: "networkidle" });
await page.fill("#project-url", "https://zzzznotrealzzzz.supabase.co");
await page.fill("#anon-key", "eyJ" + "a".repeat(80));
await page.getByRole("button", { name: /^connect$/i }).click();
await page.waitForTimeout(6000);
out.unreachableMsg = await page
  .locator("p.text-destructive")
  .first()
  .innerText()
  .catch(() => "(none)");

// 2. no backend: the site still renders and the PIN gate still works
await page.goto("http://localhost:5173/#/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
out.heroHeadline = await page.locator("h1").first().innerText();
out.siteOverflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);

await page.goto("http://localhost:5173/#/admin", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
out.adminGate = await page.locator("h1").first().innerText();
out.pinField = await page.locator("#pin").count();
await page.fill("#pin", "2468");
await page.getByRole("button", { name: /^sign in$/i }).click();
await page.waitForTimeout(600);
out.adminAfterPin = await page.locator("h1").first().innerText().catch(() => "(none)");
out.tabs = await page.locator('[role="tab"]').allInnerTexts();

// 3. booking form still submits without a backend
await page.goto("http://localhost:5173/#/", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
out.bookingFormPresent = await page.locator("#booking").count();

console.log(JSON.stringify({ ...out, errors }, null, 2));
await browser.close();
