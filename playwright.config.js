// playwright.config.js
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './',
  timeout: 120000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  },
  reporter: [['list'], ['html', { outputFolder: 'tests/reports/playwright-html' }]]
});
