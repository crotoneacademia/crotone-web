// Render the typography-based social card with the same locally bundled font.
const { chromium } = require("@playwright/test");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  const font = fs
    .readFileSync(
      require.resolve("@fontsource/inter/files/inter-latin-500-normal.woff2"),
    )
    .toString("base64");
  const logo = fs.readFileSync("static/img/brand/crotone-logo.png").toString("base64");
  await page.setContent(
    `<style>@font-face{font-family:Inter;src:url(data:font/woff2;base64,${font})}*{box-sizing:border-box}body{margin:0;background:#f7f6f3;color:#171717;font-family:Inter,Arial;padding:45px 75px}.brand{display:flex;align-items:center;gap:20px;font-size:25px;letter-spacing:4px;border-bottom:1px solid #b8b5ad;padding-bottom:20px}.label{font-size:13px;letter-spacing:3px;margin-top:32px;color:#b32923}h1{font-size:67px;font-weight:500;line-height:1.08;letter-spacing:-3px;margin:30px 0}em{color:#b32923;font-style:normal}.bottom{margin-top:42px;font-size:15px;display:flex;justify-content:space-between;color:#686868}</style><div class="brand"><img src="data:image/png;base64,${logo}" width="80" height="76" style="object-fit:contain;mix-blend-mode:multiply"/>CROTONE ACADEMIA</div><div class="label">EXPLORE • QUESTION • UNDERSTAND</div><h1>Knowledge at the intersection<br>of <em>intelligence,</em> science<br>and discovery.</h1><div class="bottom"><span>Independent inquiry. Open knowledge.</span><span>crotone.academy ↗</span></div>`,
  );
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all(Array.from(document.images).map(img => img.decode())); });
  await page.screenshot({ path: "static/img/brand/social-preview.png" });
  await browser.close();
})();
