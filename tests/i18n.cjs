const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
function messageKeys(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => typeof child === 'string' ? [`${prefix}${key}`] : messageKeys(child, `${prefix}${key}.`)).sort();
}
assert.deepEqual(messageKeys(require('../src/locales/en.json')), messageKeys(require('../src/locales/fa.json')));
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'warning' && message.text().includes('[intlify]')) errors.push(message.text()); });
    await page.goto(process.env.BASE_URL || 'http://localhost:5173');
    await page.getByRole('textbox', { name: 'یادداشت کوچک', exact: true }).fill('یادداشت من — My note');
    const initial = await page.evaluate(() => JSON.parse(localStorage.getItem('konj-state')).data.instances);
    // Old dashboards have no language field. They must still load as Persian.
    await page.evaluate(() => { const state = JSON.parse(localStorage.getItem('konj-state')); delete state.data.preferences.language; localStorage.setItem('konj-state', JSON.stringify(state)); });
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('lang'), 'fa');
    await page.getByRole('button', { name: 'تنظیمات', exact: true }).click();
    async function checkChevron(direction) {
      for (const wrapper of await page.locator('.select-field').all()) {
        const field = await wrapper.boundingBox(); const icon = await wrapper.locator('svg').boundingBox();
        const gap = direction === 'rtl' ? icon.x - field.x : field.x + field.width - icon.x - icon.width;
        assert.ok(gap >= 12 && gap <= 16, `Chevron inset: ${gap}`);
        const trigger = wrapper.getByRole('combobox');
        await trigger.click();
        const triggerBox = await trigger.boundingBox();
        const menu = await wrapper.getByRole('listbox').boundingBox();
        assert.ok(Math.abs(menu.x - triggerBox.x) < 1, 'Menu horizontal alignment');
        assert.ok(Math.abs(menu.width - triggerBox.width) < 1, 'Menu width');
        const below = Math.abs(menu.y - triggerBox.y - triggerBox.height - 6) < 1;
        const above = Math.abs(triggerBox.y - menu.y - menu.height - 6) < 1;
        assert.ok(below || above, 'Menu anchored to trigger');
        await page.keyboard.press('Escape');
        assert.equal(await wrapper.getByRole('listbox').count(), 0);
        assert.equal(await page.locator('dialog').isVisible(), true, 'Escape keeps modal open');
      }
    }
    await checkChevron('rtl');
    await page.getByRole('combobox', { name: 'زبان' }).click();
    await page.getByRole('option', { name: 'English', exact: true }).click();
    assert.equal(await page.locator('html').getAttribute('dir'), 'ltr');
    await page.getByRole('heading', { name: 'Your very own Konj' }).waitFor();
    await checkChevron('ltr');
    await page.screenshot({ path: join(tmpdir(), 'konj-english-settings.png'), fullPage: true });
    await page.keyboard.press('Escape');
    await page.getByRole('heading', { name: 'Clock & calendar', exact: true }).waitFor();
    assert.match(await page.locator('.clock-time').innerText(), /^[0-9:]+$/);
    assert.equal(await page.locator('.poem-lines').getAttribute('dir'), 'rtl');
    assert.equal(await page.getByRole('textbox', { name: 'Little note', exact: true }).inputValue(), 'یادداشت من — My note');
    await page.getByRole('button', { name: 'Add widget', exact: true }).click();
    await page.locator('.catalog-item').filter({ hasText: 'Clock & calendar' }).getByRole('button').click();
    await page.locator('dialog').getByRole('button', { name: 'Close', exact: true }).click();
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('konj-state')).data);
    assert.equal(saved.preferences.language, 'en');
    assert.deepEqual(saved.instances.slice(0, initial.length), initial);
    await page.getByRole('button', { name: 'Edit layout', exact: true }).click();
    const clock = page.locator('.widget-clock').first();
    const resizer = clock.locator('.resize-handle');
    await resizer.focus(); await page.keyboard.press('ArrowRight');
    const resized = await page.evaluate(() => JSON.parse(localStorage.getItem('konj-state')).data.instances[0].position.w);
    assert.equal(resized, initial[0].position.w + 1);
    await resizer.focus(); await page.keyboard.press('ArrowLeft');
    await page.getByRole('button', { name: 'Done editing', exact: true }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('.widget')].some(el => { const r = el.getBoundingClientRect(); return r.left < 0 || r.right > innerWidth; })), false);
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await checkChevron('ltr');
    const box = await page.locator('dialog').boundingBox();
    assert.ok(Math.abs(box.x + box.width / 2 - 195) < 2);
    await page.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: 'فارسی', exact: true }).click();
    await checkChevron('rtl');
    await page.keyboard.press('Escape'); await page.reload();
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    assert.deepEqual(errors, []);
    console.log('PASS: language migration, English/Persian switching, persistence, translated widgets, preserved content, LTR resizing, mobile layout, and select chevron spacing.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
