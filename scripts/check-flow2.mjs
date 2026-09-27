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

await page.goto("http://localhost:5173/#/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);
await page.locator("#book").scrollIntoViewIfNeeded();
await page.waitForTimeout(300);

await page.fill("#name", "Chidi Okonkwo");
await page.fill("#phone", "08031234567");
await page.fill("#address", "14 Fola Osibo Street");
await page.locator("#area").selectOption({ index: 1 });
await page.waitForTimeout(200);

const serviceBtn = page.locator("#book button").filter({ hasText: /₦/ }).first();
await serviceBtn.click();
await page.waitForTimeout(200);

const datePill = page.locator("#book button").filter({ hasText: /^\d{1,2}$/ }).first();
await datePill.click().catch(() => {});
await page.waitForTimeout(300);
const slot = page.locator("#book button").filter({ hasText: /^\d{1,2}:\d{2}/ }).first();
if (await slot.count()) await slot.click();
await page.waitForTimeout(300);

const submit = page.getByRole("button", { name: /request|book|send/i }).last();
await submit.click();
await page.waitForTimeout(1200);
out.afterSubmitUrl = page.url();
out.confirmHeading = await page.locator("h1").first().innerText().catch(() => "(none)");
out.confirmHasName = await page.getByText("Chidi Okonkwo").count();

await page.goto("http://localhost:5173/#/my-bookings", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(600);
await page.locator("input").first().fill("08031234567");
await page.getByRole("button", { name: /find|look|show|search/i }).first().click();
await page.waitForTimeout(800);
out.lookupFound = await page.getByText("Chidi Okonkwo").count();

console.log(JSON.stringify({ ...out, errors }, null, 2));
await browser.close();
