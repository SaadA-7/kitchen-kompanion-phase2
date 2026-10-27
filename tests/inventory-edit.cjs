// Run with Node and a Playwright module path, e.g. node tests/inventory-edit.cjs /path/to/playwright
const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 640, height: 960 }, offline: true });
    const page = await context.newPage();
    page.setDefaultTimeout(2500);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.getByRole('button', { name: 'Reset Demo Data' }).click();
    const readItems = () => page.evaluate(() => JSON.parse(localStorage.getItem('kk_inventory')));
    const initial = await readItems();
    const screenshots = path.resolve(__dirname, '../docs/checkpoint/screenshots');
    fs.mkdirSync(screenshots, { recursive: true });
    await page.screenshot({ path: path.join(screenshots, 'inventory-before-edit.png') });
    await page.getByRole('button', { name: 'Edit Fresh spinach', exact: true }).click();
    assert.equal(await page.locator('#food-name-input').inputValue(), 'Fresh spinach');
    assert.equal(await page.locator('#food-qty-input').inputValue(), '2');
    assert.equal(await page.locator('#food-unit-input').inputValue(), 'cups');
    assert.equal(await page.locator('#food-location-input').inputValue(), 'Fridge');
    assert.equal(await page.locator('#food-owner-input').inputValue(), 'Shared');
    assert.equal(await page.locator('#food-expiry-input').inputValue(), '1');
    await page.locator('#food-qty-input').fill('3');
    await page.locator('#food-location-input').selectOption('Freezer');
    await page.locator('#food-owner-input').selectOption("Alex's");
    await page.locator('#food-expiry-input').fill('30');
    await page.screenshot({ path: path.join(screenshots, 'edit-food.png') });
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    const saved = await readItems();
    assert.equal(saved.length, initial.length);
    assert.deepEqual(saved[0], { ...initial[0], quantity: 3, location: 'Freezer', owner: "Alex's", daysUntilExpiration: 30 });
    assert.deepEqual(saved.slice(1), initial.slice(1));
    await page.screenshot({ path: path.join(screenshots, 'inventory-after-edit.png') });
    await page.reload();
    assert.deepEqual(await readItems(), saved);
    console.log('PASS: edit updates one item, preserves unrelated data, and survives reload');

    await page.getByRole('button', { name: 'Edit Fresh spinach', exact: true }).click();
    await page.locator('#food-name-input').fill('Unsaved name');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    assert.deepEqual(await readItems(), saved);
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'Edit Fresh spinach');
    await page.getByRole('button', { name: 'Edit Fresh spinach', exact: true }).click();
    await page.locator('#food-qty-input').fill('9');
    await page.keyboard.press('Escape');
    assert.deepEqual(await readItems(), saved);
    await page.getByRole('button', { name: 'Edit Fresh spinach', exact: true }).click();
    await page.getByRole('button', { name: 'Close food dialog' }).focus();
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.locator('#save-food-btn').evaluate(el => el === document.activeElement), true);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('#close-add-modal-btn').evaluate(el => el === document.activeElement), true);
    await page.getByRole('button', { name: 'Close food dialog' }).click();
    assert.deepEqual(await readItems(), saved);
    console.log('PASS: Cancel, close, and Escape discard changes; keyboard focus stays in the dialog and returns on close');

    await page.getByRole('button', { name: 'Edit Fresh spinach', exact: true }).click();
    await page.locator('#food-name-input').fill('   ');
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    assert.deepEqual(await readItems(), saved);
    assert.equal(await page.locator('#food-name-input').evaluate(el => el.validity.valid), false);
    await page.locator('#food-name-input').fill('Fresh spinach');
    for (const [field, value] of [['#food-qty-input', '0'], ['#food-qty-input', '1.5'], ['#food-expiry-input', '-1']]) {
      await page.locator(field).fill(value);
      await page.getByRole('button', { name: 'Save changes', exact: true }).click();
      assert.deepEqual(await readItems(), saved);
      await page.locator(field).fill(field.includes('qty') ? '3' : '30');
    }
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    console.log('PASS: blank names and invalid numeric values cannot change saved data');

    await page.getByRole('button', { name: 'Freezer', exact: true }).click();
    await page.getByRole('button', { name: 'Edit Fresh spinach', exact: true }).click();
    await page.locator('#food-location-input').selectOption('Fridge');
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: 'Edit Fresh spinach', exact: true }).count(), 0);
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.getByRole('button', { name: 'Edit Fresh spinach', exact: true }).click();
    const literalName = '<img src=x onerror="window.injected=true">';
    await page.locator('#food-name-input').fill(literalName);
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    assert.equal(await page.locator('.food-name').filter({ hasText: literalName }).count(), 1);
    assert.equal(await page.evaluate(() => window.injected), undefined);
    assert.equal(await page.locator('#inventory-grid img').count(), 0);
    console.log('PASS: edits refresh active filters and HTML-like names render as text');

    await page.getByRole('button', { name: '+ Add food', exact: true }).click();
    assert.equal(await page.locator('#food-name-input').inputValue(), '');
    await page.locator('#food-name-input').fill('Whole milk');
    await page.getByRole('button', { name: 'Add to Kitchen', exact: true }).click();
    assert.equal((await readItems()).length, 10);
    const milk = page.locator('.food-card').filter({ hasText: 'Whole milk' });
    await milk.getByRole('button', { name: '+', exact: true }).click();
    assert.equal((await readItems()).find(item => item.name === 'Whole milk').quantity, 2);
    await milk.locator('.owner-badge').click();
    assert.equal((await readItems()).find(item => item.name === 'Whole milk').owner, "Alex's");
    await page.getByRole('button', { name: 'Reset Demo Data' }).click();
    assert.deepEqual(await readItems(), initial);
    const nav = await page.locator('#nav-bar').boundingBox();
    assert.ok(nav.x >= 0 && nav.y + nav.height <= 960);
    assert.equal(await page.evaluate(() => document.querySelector('#app-device').scrollWidth), 640);
    assert.deepEqual(errors, []);
    console.log('PASS: add, quantity, ownership, reset, and 640x960 layout remain functional; no page errors');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
