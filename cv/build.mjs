// Prints the CV to PDF in English and Finnish, in two versions each:
//   cv/out/         with your phone number, for sending to employers
//   cv/out/public/  without it, for the website
// The phone number lives in cv/phone.txt, which is never committed.
//
//   npm run cv
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import puppeteer from "puppeteer-core";

const dir = fileURLToPath(new URL(".", import.meta.url));
const browserPath = process.env.BROWSER ?? "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
const site = process.env.SITE ?? "magnus.is-a.dev";
const phone = (await readFile(`${dir}phone.txt`, "utf8").catch(() => "")).trim();

if (!phone) {
  console.error("Put your phone number in cv/phone.txt first.");
  process.exit(1);
}

const builds = [
  { lang: "en", out: "out/Magnus-Kaur-CV.pdf", phone },
  { lang: "fi", out: "out/Magnus-Kaur-CV-suomi.pdf", phone },
  { lang: "en", out: "out/public/magnus-kaur-cv.pdf" },
  { lang: "fi", out: "out/public/magnus-kaur-cv-suomi.pdf" },
];

const css = await readFile(`${dir}cv.css`, "utf8");
await mkdir(`${dir}out/public`, { recursive: true });

const browser = await puppeteer.launch({ executablePath: browserPath });
try {
  for (const build of builds) {
    const source = await readFile(`${dir}cv.${build.lang}.html`, "utf8");
    const html = source
      // The public copy drops the phone line entirely.
      .replace(/^.*\{\{PHONE\}\}.*\n/m, (line) => (build.phone ? line.replace("{{PHONE}}", build.phone) : ""))
      .replaceAll("{{SITE}}", site)
      .replace('<link rel="stylesheet" href="cv.css" />', `<style>${css}</style>`);

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);

    // The page is a fixed A4 sheet, so anything that doesn't fit would be cut off silently.
    const overflow = await page.$eval(".page", (sheet) => sheet.scrollHeight - sheet.clientHeight);
    if (overflow > 0) throw new Error(`${build.out} is ${overflow}px too long for one page`);

    await page.pdf({ path: `${dir}${build.out}`, preferCSSPageSize: true, printBackground: true });
    await page.close();
    console.log(`cv/${build.out}`);
  }
} finally {
  await browser.close();
}
