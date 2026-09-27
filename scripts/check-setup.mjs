import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("console: " + m.text());
});

await page.goto("http://localhost:5173/#/setup", { waitUntil: "networkidle" });
await page.waitForTimeout(600);

const heading = await page.locator("h1").first().innerText();
const hasUrl = await page.locator("#project-url").count();
const hasKey = await page.locator("#anon-key").count();
const connectBtn = await page.getByRole("button", { name: /connect/i }).count();
const copyBtn = await page.getByRole("button", { name: /copy the whole script/i }).count();
const dlBtn = await page.getByRole("button", { name: /download as a file/i }).count();
const preText = await page.locator("#schema-text").innerText();
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);

// bad URL should be rejected with a helpful message
await page.fill("#project-url", "not-a-url");
await page.fill("#anon-key", "x".repeat(60));
await page.getByRole("button", { name: /^connect$/i }).click();
await page.waitForTimeout(300);
const badMsg = await page.locator("p.text-destructive").first().innerText().catch(() => "(none)");

// good-looking URL but unreachable project: should report, not crash
await page.fill("#project-url", "https://zzzznotrealzzzz.supabase.co");
await page.fill("#anon-key", "eyJ" + "a".repeat(80));
await page.getByRole("button", { name: /^connect$/i }).click();
await page.waitForTimeout(6000);
const netMsg = await page.locator("p.text-destructive").first().innerText().catch(() => "(none)");

console.log(
  JSON.stringify(
    {
      heading,
      hasUrl,
      hasKey,
      connectBtn,
      copyBtn,
      dlBtn,
      schemaChars: preText.length,
      schemaFirstLine: preText.split("\n")[0],
      schemaLastLine: preText.trim().split("\n").pop(),
      overflow,
      badMsg,
      netMsg,
      errors,
    },
    null,
    2,
  ),
);

await browser.close();
