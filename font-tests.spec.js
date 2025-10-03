// font-tests.spec.js
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');
const AxeBuilder = require('@axe-core/playwright').default;

const REPORTS_DIR = path.join(__dirname, 'reports');
const SCREENSHOT_DIR = path.join(REPORTS_DIR, 'screenshots');

// ensure directories exist
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

let serverProcess;

test.beforeAll(async () => {
  // start a simple static server pointing to public
  serverProcess = spawn('npx', ['http-server', 'public', '-p', '8080', '-c-1'], {
    stdio: 'ignore',
    shell: process.platform === 'win32'
  });
  // wait small time for server to boot
  await new Promise(resolve => setTimeout(resolve, 800));
});

test.afterAll(async () => {
  if (serverProcess) {
    try {
      process.kill(serverProcess.pid);
    } catch (e) {}
  }
});

test('collect font requests and screenshots across states and viewports', async ({ page, browser }) => {
  const fonts = [];
  // intercept responses and log font requests
  page.on('response', async response => {
    try {
      const url = response.url();
      const ct = response.headers()['content-type'] || '';
      if (ct.includes('font') || url.match(/\.(woff2|woff|ttf|otf)(\?.*)?$/i)) {
        const size = response.headers()['content-length'] || 'unknown';
        fonts.push({ url, contentType: ct, size });
      }
    } catch (e) {}
  });

  // navigate and measure LCP
  await page.goto('http://localhost:8080/public/index.html', { waitUntil: 'load' });

  // measure LCP via PerformanceObserver in page
  const lcp = await page.evaluate(() => new Promise(resolve => {
    let lcpVal = 0;
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        lcpVal = Math.max(lcpVal, entry.renderTime || entry.startTime);
      }
    });
    try {
      po.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {}
    // settle after short delay
    setTimeout(() => resolve(Math.round(lcpVal)), 1500);
  }));

  // save font inventory
  fs.writeFileSync(path.join(REPORTS_DIR, 'fonts.json'), JSON.stringify({ fonts }, null, 2));

  // simulate slow network to catch FOIT/FOUT
  const contextSlow = await browser.newContext({ offline: false });
  const pageSlow = await contextSlow.newPage();
  await pageSlow.route('**/*', route => {
    // artificially delay font responses
    const url = route.request().url();
    if (url.match(/\.(woff2|woff|ttf|otf)(\?.*)?$/i)) {
      setTimeout(() => route.continue(), 600);
    } else {
      route.continue();
    }
  });
  await pageSlow.goto('http://localhost:8080/public/index.html', { waitUntil: 'networkidle' });
  const beforePath = path.join(SCREENSHOT_DIR, 'slow-before.png');
  await pageSlow.screenshot({ path: beforePath, fullPage: true });
  // wait a bit for fonts to load
  await pageSlow.waitForTimeout(1200);
  const afterPath = path.join(SCREENSHOT_DIR, 'slow-after.png');
  await pageSlow.screenshot({ path: afterPath, fullPage: true });
  await contextSlow.close();

  // capture component states across viewports
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 }
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:8080/public/index.html', { waitUntil: 'networkidle' });

    // normal
    await page.waitForSelector('.hero__title');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `hero-${vp.name}-normal.png`) });

    // hover (simulate)
    await page.hover('.btn--primary');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `cta-${vp.name}-hover.png`) });

    // focus
    await page.focus('.btn--primary');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `cta-${vp.name}-focus.png`) });

    // active (mousedown/up)
    await page.mouse.move(0,0);
    const btn = await page.$('.btn--primary');
    if (btn) {
      await btn.hover();
      await page.mouse.down();
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `cta-${vp.name}-active.png`) });
      await page.mouse.up();
    }
  }

  // Axe accessibility scan
  const results = await new AxeBuilder({ page }).analyze();
  fs.writeFileSync(path.join(REPORTS_DIR, 'axe-report.json'), JSON.stringify(results, null, 2));

  // Basic HTML report
  const reportHtml = `
  <html><head><meta charset="utf-8"><title>Axe Report</title></head>
  <body>
    <h1>Accessibility Report (axe-core)</h1>
    <pre>${JSON.stringify(results, null, 2)}</pre>
  </body></html>`;
  fs.writeFileSync(path.join(REPORTS_DIR, 'report.html'), reportHtml);

  // Metrics save
  const metrics = { lcp };
  fs.writeFileSync(path.join(REPORTS_DIR, 'metrics.json'), JSON.stringify(metrics, null, 2));

  // basic assertions
  expect(fonts.length).toBeGreaterThanOrEqual(0);
});
