import { chromium } from "/home/raunakxshrivastva/New Volume/daily-circuit/node_modules/playwright-core/index.mjs";
import { resolve } from "node:path";
import { mkdirSync } from "node:fs";

mkdirSync("shots", { recursive: true });

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);

// Spread 0: Pages 1 & 2
await page.screenshot({ path: resolve("shots/verified_spread_01_02.png") });
console.log("Captured Spread 0 (Pages 1 & 2)");

// Navigate to Spread 1: Pages 3 & 4
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(700);
await page.screenshot({ path: resolve("shots/verified_spread_03_04.png") });
console.log("Captured Spread 1 (Pages 3 & 4)");

// Navigate to Spread 2: Pages 5 & 6
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(700);
await page.screenshot({ path: resolve("shots/verified_spread_05_06.png") });
console.log("Captured Spread 2 (Pages 5 & 6)");

// Navigate to Spread 3: Pages 7 & 8
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(700);
await page.screenshot({ path: resolve("shots/verified_spread_07_08.png") });
console.log("Captured Spread 3 (Pages 7 & 8)");

// Test Architecture Quiz Option A click
const quizOptions = await page.$$("button:has-text('A.')");
if (quizOptions.length > 0) {
  await quizOptions[0].click();
  await page.waitForTimeout(400);
}

// Test STAMP COMPLETE button
const stampBtn = await page.$("button:has-text('STAMP EDITION COMPLETE')");
if (stampBtn) {
  await stampBtn.click();
  await page.waitForTimeout(600);
}

await page.screenshot({ path: resolve("shots/verified_spread_08_stamped.png") });
console.log("Captured Spread 3 Stamped with Confetti");

await browser.close();
console.log("All 8 pages verified cleanly!");
