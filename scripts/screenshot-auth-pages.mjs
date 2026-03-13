#!/usr/bin/env node
/**
 * Screenshot script for login and signup pages
 * Run: node scripts/screenshot-auth-pages.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";

const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = join(process.cwd(), "screenshots");

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  const pages = [
    { path: "/login", name: "login" },
    { path: "/signup", name: "signup" },
  ];

  for (const { path, name } of pages) {
    const url = `${BASE_URL}${path}`;
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1000); // Allow animations/transitions

    const filepath = join(OUTPUT_DIR, `${name}-page.png`);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`Screenshot saved: ${filepath}`);
  }

  await browser.close();
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
